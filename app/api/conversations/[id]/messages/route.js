import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendNewMessageEmail } from '@/lib/email'

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

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true },
        },
        quote: true,
      },
    })

    // Mark unread messages as read for this user
    const unreadField = isVendor ? 'unreadVendor' : 'unreadCustomer'
    const currentUnread = isVendor ? conversation.unreadVendor : conversation.unreadCustomer

    if (currentUnread > 0) {
      await prisma.conversation.update({
        where: { id },
        data: { [unreadField]: 0 },
      })
    }

    const mapped = messages.map((msg) => {
      const isMe = msg.senderId === user.id
      const senderIsVendor = msg.senderId === conversation.vendor.userId
      const avatar = !isMe
        ? (senderIsVendor ? conversation.vendor.profileImageUrl : conversation.customer.avatarUrl) || null
        : null
      const senderName = !isMe
        ? (senderIsVendor ? conversation.vendor.businessName : conversation.customer.fullName) || null
        : null

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
        timestamp: new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      }
    })

    return NextResponse.json({ messages: mapped })
  } catch (err) {
    console.error('Messages fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { text, attachmentUrl, attachmentName, attachmentType } = await request.json()

  if (!text?.trim() && !attachmentUrl) {
    return NextResponse.json({ error: 'Message text or attachment is required' }, { status: 400 })
  }

  try {
    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        vendor: { select: { userId: true, businessName: true, user: { select: { email: true } } } },
        customer: { select: { userId: true, fullName: true, user: { select: { email: true } } } },
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

    // Create message and update conversation in a transaction
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
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

    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: 'message_received',
        title: 'New message',
        body: text?.trim() ? text.trim().slice(0, 100) : `📎 Sent an attachment: ${attachmentName || 'file'}`,
        link: recipientLink,
      },
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
