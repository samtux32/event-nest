import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendNewMessageEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import { sendMessageSchema } from '@/lib/validation/messageSchemas'
import { rateLimit, limiters } from '@/lib/rate-limit'

async function getDbUserId(authUserId, email) {
  let dbUser = await prisma.user.findUnique({ where: { id: authUserId }, select: { id: true } })
  if (!dbUser && email) {
    dbUser = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  }
  return dbUser?.id ?? authUserId
}

export async function GET(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100)
  const cursor = url.searchParams.get('cursor') // ISO date string

  try {
    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        vendor: { select: { userId: true, profileImageUrl: true, businessName: true } },
        customer: { select: { userId: true, avatarUrl: true, fullName: true } },
        booking: { select: { id: true, proposedDate: true, eventDate: true } },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const dbUserId = await getDbUserId(user.id, user.email)
    const isVendor = conversation.vendor.userId === dbUserId
    const isCustomer = conversation.customer.userId === dbUserId

    if (!isVendor && !isCustomer) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Fetch messages with cursor pagination
    const whereClause = { conversationId: id }
    if (cursor) {
      whereClause.createdAt = { lt: new Date(cursor) }
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      include: {
        sender: {
          select: { id: true },
        },
        quote: true,
      },
    })

    const hasMore = messages.length > limit
    if (hasMore) messages.pop()
    messages.reverse() // Back to chronological order

    // Mark unread messages as read for this user (only on initial load, not "load older")
    if (!cursor) {
      const unreadField = isVendor ? 'unreadVendor' : 'unreadCustomer'
      const currentUnread = isVendor ? conversation.unreadVendor : conversation.unreadCustomer

      if (currentUnread > 0) {
        await prisma.conversation.update({
          where: { id },
          data: { [unreadField]: 0 },
        })
      }
    }

    const mapped = messages.map((msg) => {
      const isMe = msg.senderId === dbUserId
      const senderIsVendor = msg.senderId === conversation.vendor.userId
      const avatar = !isMe
        ? (senderIsVendor ? conversation.vendor.profileImageUrl : conversation.customer.avatarUrl) || null
        : null
      const senderName = !isMe
        ? (senderIsVendor ? conversation.vendor.businessName : conversation.customer.fullName) || null
        : null

      // Soft-deleted messages show placeholder only
      if (msg.deletedAt) {
        return {
          id: msg.id,
          sender: isMe ? 'me' : 'them',
          text: null,
          type: 'deleted',
          attachmentUrl: null,
          attachmentName: null,
          attachmentType: null,
          avatar,
          senderName,
          quote: null,
          createdAt: msg.createdAt.toISOString(),
          timestamp: new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        }
      }

      return {
        id: msg.id,
        sender: isMe ? 'me' : 'them',
        text: msg.text,
        type: msg.type,
        attachmentUrl: msg.attachmentUrl || null,
        attachmentName: msg.attachmentName || null,
        attachmentType: msg.attachmentType || null,
        avatar,
        senderName,
        quote: msg.quote ? {
          id: msg.quote.id,
          title: msg.quote.title,
          description: msg.quote.description,
          price: Number(msg.quote.price),
          features: msg.quote.features,
          status: msg.quote.status,
          bookingId: msg.quote.bookingId,
        } : null,
        // For date_proposal messages, include booking date info
        ...(msg.type === 'date_proposal' && conversation.booking ? {
          bookingId: conversation.booking.id,
          proposedDate: conversation.booking.proposedDate
            ? conversation.booking.proposedDate.toISOString().split('T')[0]
            : null,
          bookingEventDate: conversation.booking.eventDate
            ? conversation.booking.eventDate.toISOString().split('T')[0]
            : null,
        } : {}),
        createdAt: msg.createdAt.toISOString(),
        timestamp: new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      }
    })

    return NextResponse.json({ messages: mapped, hasMore })
  } catch (err) {
    console.error('Messages fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const limited = await rateLimit(request, limiters.messages)
  if (limited) return limited

  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const result = sendMessageSchema.safeParse(body)
  if (!result.success) {
    const msg = result.error.issues.map(i => i.message).join(', ')
    return NextResponse.json({ error: msg }, { status: 400 })
  }
  const { text, attachmentUrl, attachmentName, attachmentType } = result.data

  try {
    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        vendor: { select: { userId: true, businessName: true, user: { select: { email: true } } } },
        customer: { select: { userId: true, fullName: true, user: { select: { email: true } } } },
        booking: { select: { status: true } },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const dbUserId = await getDbUserId(user.id, user.email)
    const isVendor = conversation.vendor.userId === dbUserId
    const isCustomer = conversation.customer.userId === dbUserId

    if (!isVendor && !isCustomer) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Block contact info before booking is confirmed/completed
    const bookingStatus = conversation.booking?.status
    const isBookingConfirmed = bookingStatus === 'confirmed' || bookingStatus === 'completed'
    if (!isBookingConfirmed && text?.trim()) {
      const contactPatterns = [
        /\b0\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/,           // UK numbers
        /\b\+\d{1,3}[\s.-]?\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/, // International
        /\(\d{3}\)\s?\d{3}[-.]?\d{4}/,                          // US (xxx) xxx-xxxx
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,                        // US xxx-xxx-xxxx
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,      // Email
      ]
      const hasContactInfo = contactPatterns.some(p => p.test(text.trim()))
      if (hasContactInfo) {
        return NextResponse.json({
          error: 'Contact information cannot be shared until a booking is confirmed. This protects both parties.',
          code: 'CONTACT_INFO_BLOCKED',
        }, { status: 400 })
      }
    }

    // Create message and update conversation in a transaction
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: dbUserId,
          text: text?.trim() || '',
          type: attachmentUrl ? 'attachment' : 'text',
          attachmentUrl: attachmentUrl || null,
          attachmentName: attachmentName || null,
          attachmentType: attachmentType || null,
        },
      }),
      prisma.conversation.update({
        where: { id },
        data: {
          lastMessageAt: new Date(),
          // Increment unread count for the OTHER party
          ...(isVendor
            ? { unreadCustomer: { increment: 1 } }
            : { unreadVendor: { increment: 1 } }),
        },
      }),
    ])

    // Notify the other party about the new message
    const recipientUserId = isVendor
      ? conversation.customer.userId
      : conversation.vendor.userId
    const recipientLink = isVendor
      ? `/customer-messages?conv=${id}`
      : `/messages?conv=${id}`

    await createNotification({
      userId: recipientUserId,
      type: 'message_received',
      title: 'New message',
      body: text?.trim() ? text.trim().slice(0, 100) : `Sent an attachment: ${attachmentName || 'file'}`,
      link: recipientLink,
    }).catch(() => {}) // fire-and-forget, don't fail the request

    const recipientEmail = isVendor
      ? conversation.customer.user?.email
      : conversation.vendor.user?.email
    const recipientName = isVendor
      ? (conversation.customer.fullName || 'there')
      : conversation.vendor.businessName
    const senderName = isVendor
      ? conversation.vendor.businessName
      : (conversation.customer.fullName || 'Customer')

    if (recipientEmail) {
      sendNewMessageEmail({
        recipientEmail,
        recipientName,
        senderName,
        preview: text?.trim()?.slice(0, 200) || null,
        conversationUrl: recipientLink,
      }).catch(() => {})
    }

    return NextResponse.json({
      message: {
        id: message.id,
        sender: 'me',
        text: message.text,
        type: message.type,
        attachmentUrl: message.attachmentUrl || null,
        attachmentName: message.attachmentName || null,
        attachmentType: message.attachmentType || null,
        timestamp: new Date(message.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      },
    })
  } catch (err) {
    console.error('Send message error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { messageId } = await request.json()

  if (!messageId) {
    return NextResponse.json({ error: 'messageId is required' }, { status: 400 })
  }

  try {
    const dbUserId = await getDbUserId(user.id, user.email)

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true, conversationId: true, type: true, deletedAt: true },
    })

    if (!message || message.conversationId !== id) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (message.senderId !== dbUserId) {
      return NextResponse.json({ error: 'You can only unsend your own messages' }, { status: 403 })
    }

    if (message.type !== 'text' && message.type !== 'attachment') {
      return NextResponse.json({ error: 'This message type cannot be unsent' }, { status: 400 })
    }

    if (message.deletedAt) {
      return NextResponse.json({ error: 'Message already deleted' }, { status: 400 })
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete message error:', err)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
