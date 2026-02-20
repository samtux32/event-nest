import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendQuoteAcceptedEmail, sendQuoteDeclinedEmail } from '@/lib/email'

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
  const { action } = body

  if (!['accept', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'action must be accept or decline' }, { status: 400 })
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        conversation: { include: { booking: true } },
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

    const existingBooking = quote.conversation?.booking || null

    if (action === 'decline') {
      await prisma.$transaction(async (tx) => {
        await tx.quote.update({
          where: { id },
          data: { status: 'declined' },
        })

        // Cancel the pending booking if one exists
        if (existingBooking) {
          await tx.booking.update({
            where: { id: existingBooking.id },
            data: { status: 'cancelled' },
          })
        }

        await tx.message.create({
          data: {
            conversationId: quote.conversationId,
            senderId: user.id,
            text: 'Quote declined.',
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

      // Notify vendor of decline
      if (quote.vendor?.user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { customerProfile: true },
        })
        const customerName = dbUser?.customerProfile?.fullName || 'A customer'
        await prisma.notification.create({
          data: {
            userId: quote.vendor.user.id,
            type: 'quote_declined',
            title: 'Quote declined',
            body: `${customerName} declined your quote.`,
            link: `/messages?conv=${quote.conversationId}`,
          },
        }).catch(() => {})

        if (quote.vendor.user.email) {
          sendQuoteDeclinedEmail({
            vendorEmail: quote.vendor.user.email,
            vendorName: quote.vendor.businessName,
            customerName,
            quoteTitle: quote.title,
          }).catch(() => {})
        }
      }

      return NextResponse.json({ status: 'declined' })
    }

    // Accept: update existing booking to confirmed, or create a new one
    const totalPrice = Number(quote.price)
    const vendorFee = Math.round(totalPrice * 0.10 * 100) / 100
    const customerFee = Math.round(totalPrice * 0.02 * 100) / 100

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { customerProfile: true },
    })

    let booking
    await prisma.$transaction(async (tx) => {
      if (existingBooking) {
        // Update the existing pending booking to confirmed
        booking = await tx.booking.update({
          where: { id: existingBooking.id },
          data: {
            status: 'confirmed',
            confirmedAt: new Date(),
            totalPrice,
            vendorFee,
            customerFee,
          },
        })
      } else {
        // No pre-existing booking — create one as confirmed
        booking = await tx.booking.create({
          data: {
            vendorId: quote.vendorId,
            customerId: quote.customerId,
            status: 'confirmed',
            confirmedAt: new Date(),
            totalPrice,
            vendorFee,
            customerFee,
          },
        })
      }

      await tx.quote.update({
        where: { id },
        data: { status: 'accepted', bookingId: booking.id },
      })

      await tx.message.create({
        data: {
          conversationId: quote.conversationId,
          senderId: user.id,
          text: '✅ Quote accepted — your booking is now confirmed!',
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

    // Notify vendor — booking is confirmed
    const customerName = dbUser?.customerProfile?.fullName || 'A customer'
    await prisma.notification.create({
      data: {
        userId: quote.vendor.userId,
        type: 'quote_accepted',
        title: '🎉 Booking confirmed!',
        body: `${customerName} accepted your quote. The booking is confirmed.`,
        link: `/`,
      },
    }).catch(() => {})

    if (quote.vendor.user?.email) {
      sendQuoteAcceptedEmail({
        vendorEmail: quote.vendor.user.email,
        vendorName: quote.vendor.businessName,
        customerName,
        quoteTitle: quote.title,
      }).catch(() => {})
    }

    return NextResponse.json({ bookingId: booking.id })
  } catch (err) {
    console.error('Quote respond error:', err)
    return NextResponse.json({ error: 'Failed to process quote response' }, { status: 500 })
  }
}
