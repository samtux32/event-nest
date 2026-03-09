import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendProfileNudgeEmail } from '@/lib/email'

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
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    // Find vendors who registered 2+ days ago and have incomplete profiles
    // Only nudge once — skip vendors who already have a complete profile
    const incompleteVendors = await prisma.vendorProfile.findMany({
      where: {
        createdAt: { lte: twoDaysAgo },
        OR: [
          { description: null },
          { description: '' },
          { profileImageUrl: null },
          { location: null },
          { location: '' },
          { packages: { none: {} } },
        ],
        // Don't nudge vendors who were already nudged (nudged within last 7 days)
        NOT: {
          lastNudgedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      include: {
        user: { select: { email: true } },
        packages: { select: { id: true }, take: 1 },
      },
    })

    let sent = 0

    for (const vendor of incompleteVendors) {
      if (!vendor.user?.email) continue

      const profileCompletion = {
        hasDescription: !!vendor.description,
        hasImage: !!vendor.profileImageUrl,
        hasPackages: vendor.packages.length > 0,
        hasLocation: !!vendor.location,
      }

      sendProfileNudgeEmail({
        vendorEmail: vendor.user.email,
        vendorName: vendor.businessName,
        profileCompletion,
      }).catch(() => {})

      // Mark as nudged so we don't email again for 7 days
      await prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: { lastNudgedAt: new Date() },
      }).catch(() => {})

      sent++
    }

    return NextResponse.json({ nudged: sent })
  } catch (err) {
    console.error('Cron profile-nudge error:', err)
    return NextResponse.json({ error: 'Failed to send nudges' }, { status: 500 })
  }
}
