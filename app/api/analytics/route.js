import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (user.user_metadata?.role !== 'vendor') return NextResponse.json({ error: 'Vendors only' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const period = parseInt(searchParams.get('period') || '30')

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, averageRating: true, totalReviews: true },
    })
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const now = new Date()
    const periodStart = new Date(now.getTime() - period * 24 * 60 * 60 * 1000)
    const prevPeriodStart = new Date(now.getTime() - period * 2 * 24 * 60 * 60 * 1000)

    const [
      currentViewsCount,
      prevViewsCount,
      currentViewsList,
      allCurrentBookings,
      prevPeriodBookings,
      allTimeBookings,
    ] = await Promise.all([
      prisma.profileView.count({ where: { vendorId: vendor.id, viewedAt: { gte: periodStart } } }),
      prisma.profileView.count({ where: { vendorId: vendor.id, viewedAt: { gte: prevPeriodStart, lt: periodStart } } }),
      prisma.profileView.findMany({
        where: { vendorId: vendor.id, viewedAt: { gte: periodStart } },
        select: { viewedAt: true },
      }),
      prisma.booking.findMany({
        where: { vendorId: vendor.id, createdAt: { gte: periodStart } },
      }),
      prisma.booking.findMany({
        where: { vendorId: vendor.id, createdAt: { gte: prevPeriodStart, lt: periodStart } },
        select: { status: true, totalPrice: true },
      }),
      prisma.booking.findMany({
        where: { vendorId: vendor.id },
        select: { status: true },
      }),
    ])

    const confirmedStatuses = ['confirmed', 'completed']

    const currentInquiries = allCurrentBookings.length
    const currentBookingsCount = allCurrentBookings.filter(b => confirmedStatuses.includes(b.status)).length
    const currentRevenue = allCurrentBookings
      .filter(b => confirmedStatuses.includes(b.status))
      .reduce((sum, b) => sum + (b.totalPrice ? parseFloat(b.totalPrice) : 0), 0)

    const prevInquiries = prevPeriodBookings.length
    const prevBookingsCount = prevPeriodBookings.filter(b => confirmedStatuses.includes(b.status)).length
    const prevRevenue = prevPeriodBookings
      .filter(b => confirmedStatuses.includes(b.status))
      .reduce((sum, b) => sum + (b.totalPrice ? parseFloat(b.totalPrice) : 0), 0)

    // Build chart data buckets
    const intervalDays = period <= 7 ? 1 : period <= 30 ? 2 : 7
    const intervals = []
    let cursor = new Date(periodStart)
    while (cursor < now) {
      const next = new Date(cursor.getTime() + intervalDays * 24 * 60 * 60 * 1000)
      intervals.push({ start: new Date(cursor), end: next > now ? new Date(now) : new Date(next) })
      cursor = next
    }

    const chartData = intervals.map(({ start, end }) => {
      const label = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      const views = currentViewsList.filter(v => new Date(v.viewedAt) >= start && new Date(v.viewedAt) < end).length
      const inquiries = allCurrentBookings.filter(b => new Date(b.createdAt) >= start && new Date(b.createdAt) < end).length
      const bookings = allCurrentBookings.filter(b =>
        confirmedStatuses.includes(b.status) &&
        b.confirmedAt &&
        new Date(b.confirmedAt) >= start &&
        new Date(b.confirmedAt) < end
      ).length
      return { date: label, views, inquiries, bookings }
    })

    // Top event types from confirmed/completed bookings this period
    const eventTypeCounts = {}
    allCurrentBookings
      .filter(b => confirmedStatuses.includes(b.status) && b.eventType)
      .forEach(b => { eventTypeCounts[b.eventType] = (eventTypeCounts[b.eventType] || 0) + 1 })
    const topEventTypes = Object.entries(eventTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([type, count]) => ({ type, count }))

    // All-time status breakdown
    const statusBreakdown = { new_inquiry: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
    allTimeBookings.forEach(b => { statusBreakdown[b.status] = (statusBreakdown[b.status] || 0) + 1 })

    // Inquiry sources from hearAbout field
    const sourceCounts = {}
    allCurrentBookings.forEach(b => {
      const src = b.hearAbout || 'Direct'
      sourceCounts[src] = (sourceCounts[src] || 0) + 1
    })

    // Peak days by day-of-week from profile views
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]
    currentViewsList.forEach(v => { dayCounts[new Date(v.viewedAt).getDay()]++ })
    const maxDayCount = Math.max(...dayCounts, 1)
    const peakDays = dayCounts
      .map((count, i) => ({ day: dayNames[i], views: count, percentage: Math.round((count / maxDayCount) * 100) }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    const avgBookingValue = currentBookingsCount > 0 ? Math.round(currentRevenue / currentBookingsCount) : 0

    return NextResponse.json({
      profileViews: currentViewsCount,
      profileViewsChange: pctChange(currentViewsCount, prevViewsCount),
      inquiries: currentInquiries,
      inquiriesChange: pctChange(currentInquiries, prevInquiries),
      bookings: currentBookingsCount,
      bookingsChange: pctChange(currentBookingsCount, prevBookingsCount),
      revenue: Math.round(currentRevenue),
      revenueChange: pctChange(currentRevenue, prevRevenue),
      avgBookingValue,
      chartData,
      topEventTypes,
      statusBreakdown,
      sourceCounts,
      peakDays,
      averageRating: vendor.averageRating ? parseFloat(vendor.averageRating) : null,
      totalReviews: vendor.totalReviews,
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
