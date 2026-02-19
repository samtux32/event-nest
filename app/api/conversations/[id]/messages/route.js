import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

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
        vendor: { select: { userId: true } },
        customer: { select: { userId: true } },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const isVendor = conversation.vendor.userId === user.id
    const isCustomer = conversation.customer.userId === user.id

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

    const mapped = messages.map((msg) => ({
      id: msg.id,
      sender: msg.senderId === user.id ? 'me' : 'them',
      text: msg.text,
      type: msg.type,
      quote: msg.quote ? {
        id: msg.quote.id,
        title: msg.quote.title,
        description: msg.quote.description,
        price: Number(msg.quote.price),
        features: msg.quote.features,
        status: msg.quote.status,
        bookingId: msg.quote.bookingId,
      } : null,
      timestamp: new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }))

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

  const { text } = await request.json()

  if (!text?.trim()) {
    return NextResponse.json({ error: 'Message text is required' }, { status: 400 })
  }

  try {
    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        vendor: { select: { userId: true } },
        customer: { select: { userId: true } },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const isVendor = conversation.vendor.userId === user.id
    const isCustomer = conversation.customer.userId === user.id

    if (!isVendor && !isCustomer) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Create message and update conversation in a transaction
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          text: text.trim(),
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
        body: text.trim().slice(0, 100),
        link: recipientLink,
      },
    }).catch(() => {}) // fire-and-forget, don't fail the request

    return NextResponse.json({
      message: {
        id: message.id,
        sender: 'me',
        text: message.text,
        timestamp: new Date(message.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      },
    })
  } catch (err) {
    console.error('Send message error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
