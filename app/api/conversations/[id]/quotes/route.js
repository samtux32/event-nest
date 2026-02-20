import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendQuoteReceivedEmail } from '@/lib/email'

export async function POST(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Only vendors can send quotes' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, price, features, eventDate } = body

  if (!title?.trim() || !price || !eventDate) {
    return NextResponse.json({ error: 'title, price and eventDate are required' }, { status: 400 })
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        vendor: { select: { id: true, userId: true, businessName: true } },
        customer: { select: { id: true, userId: true, fullName: true, user: { select: { email: true } } } },
        booking: { select: { id: true } },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.vendor.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const totalPrice = parseFloat(price)
    const vendorFee = Math.round(totalPrice * 0.10 * 100) / 100
    const customerFee = Math.round(totalPrice * 0.02 * 100) / 100

    const [quote] = await prisma.$transaction(async (tx) => {
      const q = await tx.quote.create({
        data: {
          conversationId: id,
          vendorId: conversation.vendor.id,
          customerId: conversation.customer.id,
          title: title.trim(),
          description: description?.trim() || null,
          price: totalPrice,
          features: features || [],
          status: 'pending',
        },
      })

      const msg = await tx.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          text: `Custom quote: ${title.trim()}`,
          type: 'quote',
          quoteId: q.id,
        },
      })

      await tx.conversation.update({
        where: { id },
        data: {
          lastMessageAt: new Date(),
          unreadCustomer: { increment: 1 },
        },
      })

      // Create or update the booking when vendor sends a quote
      if (conversation.booking?.id) {
        // Existing booking — update the confirmed date and price
        await tx.booking.update({
          where: { id: conversation.booking.id },
          data: { eventDate: new Date(eventDate), totalPrice, vendorFee, customerFee },
        })
      } else {
        // No booking yet — create a pending one (shows in calendar as Pending)
        const booking = await tx.booking.create({
          data: {
            vendorId: conversation.vendor.id,
            customerId: conversation.customer.id,
            eventDate: new Date(eventDate),
            status: 'new_inquiry',
            totalPrice,
            vendorFee,
            customerFee,
          },
        })
        await tx.conversation.update({
          where: { id },
          data: { bookingId: booking.id },
        })
      }

      return [q, msg]
    })

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: conversation.customer.userId,
        type: 'quote_received',
        title: 'New custom quote received',
        body: `${conversation.vendor.businessName} has sent you a custom quote: ${title.trim()}`,
        link: `/customer-messages?conv=${id}`,
      },
    })

    if (conversation.customer.user?.email) {
      sendQuoteReceivedEmail({
        customerEmail: conversation.customer.user.email,
        customerName: conversation.customer.fullName || 'there',
        vendorName: conversation.vendor.businessName,
        quoteTitle: title.trim(),
        price,
      }).catch(() => {})
    }

    return NextResponse.json({ quote })
  } catch (err) {
    console.error('Create quote error:', err)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
