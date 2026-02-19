import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'customer') {
    return NextResponse.json({ error: 'Only customers can respond to quotes' }, { status: 403 })
  }

  const body = await request.json()
  const { action, eventDate, eventType, guestCount, venueName } = body

  if (!['accept', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'action must be accept or decline' }, { status: 400 })
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        conversation: true,
        vendor: { include: { user: true } },
        customer: { include: { user: true } },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (quote.customer.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (quote.status !== 'pending') {
      return NextResponse.json({ error: 'Quote is already resolved' }, { status: 400 })
    }

    if (action === 'decline') {
      await prisma.$transaction([
        prisma.quote.update({
          where: { id },
          data: { status: 'declined' },
        }),
        prisma.message.create({
          data: {
            conversationId: quote.conversationId,
            senderId: user.id,
            text: 'Quote declined.',
            type: 'text',
          },
        }),
        prisma.conversation.update({
          where: { id: quote.conversationId },
          data: {
            lastMessageAt: new Date(),
            unreadVendor: { increment: 1 },
          },
        }),
      ])

      return NextResponse.json({ status: 'declined' })
    }

    // Accept: create booking
    const totalPrice = Number(quote.price)
    const vendorFee = Math.round(totalPrice * 0.10 * 100) / 100
    const customerFee = Math.round(totalPrice * 0.02 * 100) / 100

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { customerProfile: true },
    })

    let booking
    await prisma.$transaction(async (tx) => {
      booking = await tx.booking.create({
        data: {
          vendorId: quote.vendorId,
          customerId: quote.customerId,
          eventDate: eventDate ? new Date(eventDate) : null,
          eventType: eventType || null,
          guestCount: guestCount ? parseInt(guestCount) : null,
          venueName: venueName || null,
          status: 'pending',
          totalPrice,
          vendorFee,
          customerFee,
        },
      })

      await tx.quote.update({
        where: { id },
        data: { status: 'accepted', bookingId: booking.id },
      })

      await tx.message.create({
        data: {
          conversationId: quote.conversationId,
          senderId: user.id,
          text: 'Quote accepted. Booking created.',
          type: 'text',
        },
      })

      await tx.conversation.update({
        where: { id: quote.conversationId },
        data: {
          lastMessageAt: new Date(),
          unreadVendor: { increment: 1 },
        },
      })
    })

    // Notify vendor
    await prisma.notification.create({
      data: {
        userId: quote.vendor.userId,
        type: 'quote_accepted',
        title: 'Quote accepted!',
        body: `${dbUser?.customerProfile?.fullName || 'A customer'} has accepted your quote and created a booking.`,
        link: '/',
      },
    })

    return NextResponse.json({ bookingId: booking.id })
  } catch (err) {
    console.error('Quote respond error:', err)
    return NextResponse.json({ error: 'Failed to process quote response' }, { status: 500 })
  }
}
