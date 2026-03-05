import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendReviewRequestEmail } from '@/lib/email'
import { createNotificationInTx } from '@/lib/notifications'

export async function GET(request) {
  // Auth: accept CRON_SECRET bearer token or Vercel's built-in cron auth header
  const authHeader = request.headers.get('authorization')
  const vercelCron = request.headers.get('x-vercel-cron')

  const cronSecret = process.env.CRON_SECRET
  const isAuthorized =
    vercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find all confirmed bookings where eventDate is in the past
    const pastConfirmedBookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        eventDate: { lt: today },
      },
      include: {
        vendor: { include: { user: true } },
        customer: { include: { user: true } },
      },
    })

    if (pastConfirmedBookings.length === 0) {
      return NextResponse.json({ completed: 0 })
    }

    // Process each booking in a transaction
    await prisma.$transaction(async (tx) => {
      for (const booking of pastConfirmedBookings) {
        // Update booking status to completed
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'completed' },
        })

        // Increment vendor's completedEventsCount
        await tx.vendorProfile.update({
          where: { id: booking.vendorId },
          data: { completedEventsCount: { increment: 1 } },
        })

        // Create notification for vendor
        if (booking.vendor?.user) {
          await createNotificationInTx(tx, {
            userId: booking.vendor.user.id,
            type: 'booking_completed',
            title: 'Event completed',
            body: `Your event with ${booking.customer?.fullName || 'a customer'} has been marked as completed. Leave a review!`,
            link: '/',
          })
        }

        // Create notification for customer
        if (booking.customer?.user) {
          await createNotificationInTx(tx, {
            userId: booking.customer.user.id,
            type: 'booking_completed',
            title: 'Event completed',
            body: `Your event with ${booking.vendor?.businessName || 'a vendor'} has been marked as completed. Leave a review!`,
            link: '/my-bookings',
          })
        }
      }
    })

    // Fire-and-forget emails for both parties
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    for (const booking of pastConfirmedBookings) {
      const eventDateStr = booking.eventDate
        ? new Date(booking.eventDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : null

      // Email to vendor
      if (booking.vendor?.user?.email) {
        sendReviewRequestEmail({
          recipientEmail: booking.vendor.user.email,
          recipientName: booking.vendor.businessName,
          otherPartyName: booking.customer?.fullName || 'your customer',
          eventType: booking.eventType,
          eventDate: eventDateStr,
          reviewUrl: '/',
          isVendor: true,
        }).catch(() => {})
      }

      // Email to customer
      if (booking.customer?.user?.email) {
        sendReviewRequestEmail({
          recipientEmail: booking.customer.user.email,
          recipientName: booking.customer.fullName || 'there',
          otherPartyName: booking.vendor?.businessName || 'your vendor',
          eventType: booking.eventType,
          eventDate: eventDateStr,
          reviewUrl: '/my-bookings',
          isVendor: false,
        }).catch(() => {})
      }
    }

    return NextResponse.json({ completed: pastConfirmedBookings.length })
  } catch (err) {
    console.error('Cron complete-bookings error:', err)
    return NextResponse.json({ error: 'Failed to complete bookings' }, { status: 500 })
  }
}
