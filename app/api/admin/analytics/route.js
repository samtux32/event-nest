import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  if (user.user_metadata?.role !== 'admin') return null
  return user
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)

    // Run all queries in parallel
    const [
      totalVendors,
      totalCustomers,
      totalBookings,
      totalReviews,
      pendingVendors,
      recentVendors,
      recentCustomers,
      recentBookings,
      bookingsByStatus,
    ] = await Promise.all([
      prisma.vendorProfile.count(),
      prisma.customerProfile.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.vendorProfile.count({ where: { isApproved: false } }),
      // Signups over last 30 days (vendors)
      prisma.vendorProfile.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Signups over last 30 days (customers)
      prisma.customerProfile.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Bookings over last 30 days
      prisma.booking.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Bookings by status
      prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    // Group signups by day
    function groupByDay(records) {
      const days = {}
      for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
        days[d.toISOString().slice(0, 10)] = 0
      }
      for (const r of records) {
        const day = new Date(r.createdAt).toISOString().slice(0, 10)
        if (days[day] !== undefined) days[day]++
      }
      return Object.entries(days).map(([date, count]) => ({ date, count }))
    }

    const statusMap = {}
    for (const s of bookingsByStatus) {
      statusMap[s.status] = s._count.status
    }

    return NextResponse.json({
      totals: {
        vendors: totalVendors,
        customers: totalCustomers,
        bookings: totalBookings,
        reviews: totalReviews,
        pendingVendors,
      },
      bookingsByStatus: statusMap,
      vendorSignups: groupByDay(recentVendors),
      customerSignups: groupByDay(recentCustomers),
      bookingsOverTime: groupByDay(recentBookings),
    })
  } catch (err) {
    console.error('Admin analytics error:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
