import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendEventReminderEmail } from '@/lib/email'

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
    // Calculate the date exactly 3 days from now (start and end of that day)
    const now = new Date()
    const threeDaysFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3)
    const threeDaysFromNowEnd = new Date(threeDaysFromNow)
    threeDaysFromNowEnd.setDate(threeDaysFromNowEnd.getDate() + 1)

    // Find all confirmed bookings where eventDate is exactly 3 days from now
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        eventDate: {
          gte: threeDaysFromNow,
          lt: threeDaysFromNowEnd,
        },
      },
      include: {
        vendor: { include: { user: true } },
        customer: { include: { user: true } },
      },
    })

    if (upcomingBookings.length === 0) {
      return NextResponse.json({ reminders: 0 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create notifications for both parties
    await prisma.$transaction(async (tx) => {
      for (const booking of upcomingBookings) {
        // Notification for vendor
        if (booking.vendor?.user) {
          await tx.notification.create({
            data: {
              userId: booking.vendor.user.id,
              type: 'event_reminder',
              title: 'Event in 3 days',
              body: `Your event with ${booking.customer?.fullName || 'a customer'} is in 3 days. Make sure everything is prepared!`,
              link: '/calendar',
            },
          })
        }

        // Notification for customer
        if (booking.customer?.user) {
          await tx.notification.create({
            data: {
              userId: booking.customer.user.id,
              type: 'event_reminder',
              title: 'Event in 3 days',
              body: `Your event with ${booking.vendor?.businessName || 'a vendor'} is in 3 days. Get ready!`,
              link: '/my-bookings',
            },
          })
        }
      }
    })

    // Fire-and-forget emails
    for (const booking of upcomingBookings) {
      const eventDateStr = booking.eventDate
        ? new Date(booking.eventDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : null

      // Email to vendor
      if (booking.vendor?.user?.email) {
        sendEventReminderEmail({
          recipientEmail: booking.vendor.user.email,
          recipientName: booking.vendor.businessName,
          otherPartyName: booking.customer?.fullName || 'your customer',
          eventType: booking.eventType,
          eventDate: eventDateStr,
          daysUntil: 3,
        }).catch(() => {})
      }

      // Email to customer
      if (booking.customer?.user?.email) {
        sendEventReminderEmail({
          recipientEmail: booking.customer.user.email,
          recipientName: booking.customer.fullName || 'there',
          otherPartyName: booking.vendor?.businessName || 'your vendor',
          eventType: booking.eventType,
          eventDate: eventDateStr,
          daysUntil: 3,
        }).catch(() => {})
      }
    }

    return NextResponse.json({ reminders: upcomingBookings.length })
  } catch (err) {
    console.error('Cron event-reminders error:', err)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
