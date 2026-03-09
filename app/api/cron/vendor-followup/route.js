import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendVendorFollowUpEmail } from '@/lib/email'

export async function GET(request) {
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
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    // Find conversations where:
    // - Vendor has unread messages (customer sent, vendor hasn't read)
    // - Last message was 24-48 hours ago (avoid spamming for older convos)
    const conversations = await prisma.conversation.findMany({
      where: {
        unreadVendor: { gt: 0 },
        lastMessageAt: {
          gte: fortyEightHoursAgo,
          lte: twentyFourHoursAgo,
        },
      },
      include: {
        vendor: {
          include: { user: { select: { email: true } } },
        },
        customer: {
          select: { fullName: true },
        },
        booking: {
          select: { id: true },
        },
      },
    })

    let sent = 0

    for (const convo of conversations) {
      if (!convo.vendor?.user?.email) continue

      sendVendorFollowUpEmail({
        vendorEmail: convo.vendor.user.email,
        vendorName: convo.vendor.businessName,
        customerName: convo.customer?.fullName || 'A customer',
        inquiryType: convo.booking ? 'booking' : 'message',
      }).catch(() => {})

      sent++
    }

    return NextResponse.json({ followups: sent })
  } catch (err) {
    console.error('Cron vendor-followup error:', err)
    return NextResponse.json({ error: 'Failed to send follow-ups' }, { status: 500 })
  }
}
