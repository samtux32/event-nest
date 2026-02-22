import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const role = user.user_metadata?.role

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        customerProfile: role === 'customer',
        vendorProfile: role === 'vendor',
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profileId = role === 'vendor'
      ? dbUser.vendorProfile?.id
      : dbUser.customerProfile?.id

    if (!profileId) {
      return NextResponse.json({ conversations: [] })
    }

    const where = role === 'vendor'
      ? { vendorId: profileId }
      : { customerId: profileId }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        vendor: {
          select: { id: true, businessName: true, profileImageUrl: true, category: true },
        },
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        booking: {
          select: { id: true, eventDate: true, eventType: true, status: true, venueName: true, venueAddress: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { text: true, createdAt: true },
        },
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    })

    const mapped = conversations.map((conv) => {
      const otherParty = role === 'vendor'
        ? { name: conv.customer.fullName, avatar: conv.customer.avatarUrl }
        : { name: conv.vendor.businessName, avatar: conv.vendor.profileImageUrl }

      const unread = role === 'vendor' ? conv.unreadVendor : conv.unreadCustomer
      const lastMsg = conv.messages[0]

      // Map booking status to inquiry status label
      const statusMap = {
        new_inquiry: 'New',
        pending: 'Pending',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled',
      }

      return {
        id: conv.id,
        name: otherParty.name,
        avatar: otherParty.avatar,
        vendorId: conv.vendor.id,
        lastMessage: lastMsg?.text || '',
        timestamp: lastMsg ? formatTimestamp(lastMsg.createdAt) : '',
        unread,
        online: false,
        bookingId: conv.booking?.id || null,
        eventDate: conv.booking?.eventDate
          ? new Date(conv.booking.eventDate).toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' })
          : null,
        eventType: conv.booking?.eventType || conv.vendor.category,
        inquiryStatus: statusMap[conv.booking?.status] || 'Active',
        venueName: conv.booking?.venueName || null,
        venueAddress: conv.booking?.venueAddress || null,
      }
    })

    return NextResponse.json({ conversations: mapped })
  } catch (err) {
    console.error('Conversations fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'customer') {
    return NextResponse.json({ error: 'Only customers can start conversations' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { vendorId } = body

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }

    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { customerProfile: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, include: { customerProfile: true } })
    }

    if (!dbUser?.customerProfile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    const conversation = await prisma.conversation.upsert({
      where: {
        vendorId_customerId: {
          vendorId,
          customerId: dbUser.customerProfile.id,
        },
      },
      update: {},
      create: {
        vendorId,
        customerId: dbUser.customerProfile.id,
      },
    })

    return NextResponse.json({ conversation })
  } catch (err) {
    console.error('Create conversation error:', err)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}

function formatTimestamp(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}
