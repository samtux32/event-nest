import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// POST — vendor proposes a date for the booking
export async function POST(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Only vendors can propose dates' }, { status: 403 })
  }

  try {
    const { proposedDate } = await request.json()

    if (!proposedDate) {
      return NextResponse.json({ error: 'proposedDate is required' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { vendorProfile: true },
    })

    if (!dbUser?.vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    // Verify booking belongs to this vendor
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        conversation: true,
      },
    })

    if (!booking || booking.vendorId !== dbUser.vendorProfile.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Find conversation (via booking or vendor+customer pair)
    const conversation = booking.conversation || await prisma.conversation.findUnique({
      where: {
        vendorId_customerId: {
          vendorId: booking.vendorId,
          customerId: booking.customerId,
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'No conversation found for this booking' }, { status: 404 })
    }

    const parsedDate = new Date(proposedDate)
    const formatted = parsedDate.toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    // Update booking with proposed date + create date_proposal message in a transaction
    const [, message] = await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: { proposedDate: parsedDate },
      }),
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          text: `📅 Date proposal: ${proposedDate}`,
          type: 'date_proposal',
        },
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          unreadCustomer: { increment: 1 },
        },
      }),
    ])

    // Notify the customer
    const customerUserId = booking.customer?.user?.id
    if (customerUserId) {
      await prisma.notification.create({
        data: {
          userId: customerUserId,
          type: 'date_proposed',
          title: `${dbUser.vendorProfile.businessName} proposed a date`,
          body: `Proposed date: ${formatted}`,
          link: `/customer-messages?conv=${conversation.id}`,
        },
      }).catch(() => {})
    }

    return NextResponse.json({ message: { id: message.id } })
  } catch (err) {
    console.error('Propose date error:', err)
    return NextResponse.json({ error: 'Failed to propose date' }, { status: 500 })
  }
}

// PATCH — customer accepts or declines the proposed date
export async function PATCH(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'customer') {
    return NextResponse.json({ error: 'Only customers can respond to date proposals' }, { status: 403 })
  }

  try {
    const { action } = await request.json()

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'action must be accept or decline' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { customerProfile: true },
    })

    if (!dbUser?.customerProfile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    // Verify booking belongs to this customer
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vendor: { include: { user: true } },
        conversation: true,
      },
    })

    if (!booking || booking.customerId !== dbUser.customerProfile.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!booking.proposedDate) {
      return NextResponse.json({ error: 'No pending date proposal' }, { status: 400 })
    }

    const updateData = action === 'accept'
      ? { eventDate: booking.proposedDate, proposedDate: null }
      : { proposedDate: null }

    await prisma.booking.update({
      where: { id },
      data: updateData,
    })

    // Notify the vendor
    const vendorUserId = booking.vendor?.user?.id
    const formatted = new Date(booking.proposedDate).toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    if (vendorUserId) {
      const title = action === 'accept'
        ? '📅 Date accepted!'
        : 'Date proposal declined'
      const body = action === 'accept'
        ? `${dbUser.customerProfile.fullName || 'The customer'} accepted ${formatted}.`
        : `${dbUser.customerProfile.fullName || 'The customer'} declined ${formatted}. You can propose a new date.`
      const conversationId = booking.conversation?.id

      await prisma.notification.create({
        data: {
          userId: vendorUserId,
          type: action === 'accept' ? 'date_accepted' : 'date_declined',
          title,
          body,
          link: conversationId ? `/messages?conv=${conversationId}` : '/calendar',
        },
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, action })
  } catch (err) {
    console.error('Date proposal response error:', err)
    return NextResponse.json({ error: 'Failed to respond to date proposal' }, { status: 500 })
  }
}
