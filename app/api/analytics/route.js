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
  const periodParam = searchParams.get('period') || '30'
  const isAllTime = periodParam === 'all'
  const period = isAllTime ? null : parseInt(periodParam)

  try {
    let vendor = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, userId: true, averageRating: true, totalReviews: true },
    })
    if (!vendor) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { vendorProfile: true },
      })
      vendor = dbUser?.vendorProfile ?? null
    }

    const emptyResponse = {
      profileViews: 0, profileViewsChange: 0,
      inquiries: 0, inquiriesChange: 0,
      bookings: 0, bookingsChange: 0,
      revenue: 0, revenueChange: 0,
      avgBookingValue: 0, chartData: [], topEventTypes: [],
      statusBreakdown: { new_inquiry: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
      sourceCounts: {}, peakDays: [], averageRating: null, totalReviews: 0,
      revenueByMonth: [], revenueByEventType: [],
      avgTimeToConfirm: null, cancellationRate: 0,
      quoteAcceptanceRate: null, avgResponseTime: null, responseRate: null,
      repeatCustomerRate: 0, upcomingRevenue: 0,
    }

    if (!vendor) return NextResponse.json(emptyResponse)

    const now = new Date()
    const periodStart = isAllTime ? new Date('2020-01-01') : new Date(now.getTime() - period * 24 * 60 * 60 * 1000)
    const prevPeriodStart = isAllTime ? null : new Date(now.getTime() - period * 2 * 24 * 60 * 60 * 1000)
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)

    // Main data queries
    const [
      currentViewsCount,
      prevViewsCount,
      currentViewsList,
      allCurrentBookings,
      prevPeriodBookings,
      allTimeBookings,
      quoteStats,
      upcomingRevenueAgg,
      recentConversations,
      last12MonthBookings,
    ] = await Promise.all([
      prisma.profileView.count({ where: { vendorId: vendor.id, viewedAt: { gte: periodStart } } }),
      isAllTime ? Promise.resolve(0) : prisma.profileView.count({ where: { vendorId: vendor.id, viewedAt: { gte: prevPeriodStart, lt: periodStart } } }),
      prisma.profileView.findMany({
        where: { vendorId: vendor.id, viewedAt: { gte: periodStart } },
        select: { viewedAt: true },
      }),
      prisma.booking.findMany({
        where: { vendorId: vendor.id, createdAt: { gte: periodStart } },
      }),
      isAllTime ? Promise.resolve([]) : prisma.booking.findMany({
        where: { vendorId: vendor.id, createdAt: { gte: prevPeriodStart, lt: periodStart } },
        select: { status: true, totalPrice: true },
      }),
      prisma.booking.findMany({
        where: { vendorId: vendor.id },
        select: { status: true, customerId: true },
      }),
      // Quote acceptance stats
      prisma.quote.groupBy({
        by: ['status'],
        where: { vendorId: vendor.id },
        _count: true,
      }),
      // Upcoming confirmed revenue
      prisma.booking.aggregate({
        where: { vendorId: vendor.id, status: 'confirmed', eventDate: { gte: now } },
        _sum: { totalPrice: true },
      }),
      // Recent conversations for response time calc (limit to 100)
      prisma.conversation.findMany({
        where: { vendorId: vendor.id, createdAt: { gte: periodStart } },
        select: {
          id: true,
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 5,
            select: { senderId: true, createdAt: true },
          },
        },
        take: 100,
      }),
      // Last 12 months of bookings for monthly chart
      prisma.booking.findMany({
        where: { vendorId: vendor.id, createdAt: { gte: twelveMonthsAgo }, status: { in: ['confirmed', 'completed'] } },
        select: { totalPrice: true, createdAt: true, eventType: true },
      }),
    ])

    const confirmedStatuses = ['confirmed', 'completed']

    // Core metrics
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

    // Chart data buckets
    const useMonthly = isAllTime || period >= 365
    let chartData = []

    if (useMonthly) {
      // Monthly aggregation
      const months = []
      const startMonth = isAllTime
        ? new Date(Math.min(...currentViewsList.map(v => new Date(v.viewedAt).getTime()), ...allCurrentBookings.map(b => new Date(b.createdAt).getTime()), now.getTime()))
        : new Date(periodStart)
      let cursor = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1)
      while (cursor <= now) {
        const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
        months.push({ start: new Date(cursor), end: next > now ? new Date(now) : new Date(next) })
        cursor = next
      }
      chartData = months.map(({ start, end }) => {
        const label = start.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
        const views = currentViewsList.filter(v => new Date(v.viewedAt) >= start && new Date(v.viewedAt) < end).length
        const inquiries = allCurrentBookings.filter(b => new Date(b.createdAt) >= start && new Date(b.createdAt) < end).length
        const bookings = allCurrentBookings.filter(b =>
          confirmedStatuses.includes(b.status) && b.confirmedAt &&
          new Date(b.confirmedAt) >= start && new Date(b.confirmedAt) < end
        ).length
        return { date: label, views, inquiries, bookings }
      })
    } else {
      const intervalDays = period <= 7 ? 1 : period <= 30 ? 2 : 7
      const intervals = []
      let cursor = new Date(periodStart)
      while (cursor < now) {
        const next = new Date(cursor.getTime() + intervalDays * 24 * 60 * 60 * 1000)
        intervals.push({ start: new Date(cursor), end: next > now ? new Date(now) : new Date(next) })
        cursor = next
      }
      chartData = intervals.map(({ start, end }) => {
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
    }

    // Top event types
    const eventTypeCounts = {}
    allCurrentBookings
      .filter(b => confirmedStatuses.includes(b.status) && b.eventType)
      .forEach(b => { eventTypeCounts[b.eventType] = (eventTypeCounts[b.eventType] || 0) + 1 })
    const topEventTypes = Object.entries(eventTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([type, count]) => ({ type, count }))

    // All-time status breakdown
    const statusBreakdown = { new_inquiry: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
    allTimeBookings.forEach(b => { statusBreakdown[b.status] = (statusBreakdown[b.status] || 0) + 1 })

    // Inquiry sources
    const sourceCounts = {}
    allCurrentBookings.forEach(b => {
      const src = b.hearAbout || 'Direct'
      sourceCounts[src] = (sourceCounts[src] || 0) + 1
    })

    // Peak days
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]
    currentViewsList.forEach(v => { dayCounts[new Date(v.viewedAt).getDay()]++ })
    const maxDayCount = Math.max(...dayCounts, 1)
    const peakDays = dayCounts
      .map((count, i) => ({ day: dayNames[i], views: count, percentage: Math.round((count / maxDayCount) * 100) }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    const avgBookingValue = currentBookingsCount > 0 ? Math.round(currentRevenue / currentBookingsCount) : 0

    // --- NEW METRICS ---

    // Revenue by month (last 12 months)
    const revenueByMonth = []
    {
      let cursor = new Date(twelveMonthsAgo)
      while (cursor <= now) {
        const monthStart = new Date(cursor)
        const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
        const monthBookings = last12MonthBookings.filter(b =>
          new Date(b.createdAt) >= monthStart && new Date(b.createdAt) < monthEnd
        )
        const revenue = monthBookings.reduce((sum, b) => sum + (b.totalPrice ? parseFloat(b.totalPrice) : 0), 0)
        revenueByMonth.push({
          month: monthStart.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
          revenue: Math.round(revenue),
          bookings: monthBookings.length,
        })
        cursor = monthEnd
      }
    }

    // Revenue by event type (from last 12 months)
    const revenueByEventType = []
    {
      const byType = {}
      last12MonthBookings.forEach(b => {
        const type = b.eventType || 'Other'
        if (!byType[type]) byType[type] = { revenue: 0, count: 0 }
        byType[type].revenue += b.totalPrice ? parseFloat(b.totalPrice) : 0
        byType[type].count++
      })
      Object.entries(byType)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .forEach(([type, data]) => {
          revenueByEventType.push({ type, revenue: Math.round(data.revenue), count: data.count })
        })
    }

    // Average time to confirm (days)
    let avgTimeToConfirm = null
    {
      const confirmedBookings = allCurrentBookings.filter(b => b.confirmedAt && b.createdAt)
      if (confirmedBookings.length > 0) {
        const totalDays = confirmedBookings.reduce((sum, b) => {
          const diff = (new Date(b.confirmedAt) - new Date(b.createdAt)) / (1000 * 60 * 60 * 24)
          return sum + diff
        }, 0)
        avgTimeToConfirm = Math.round((totalDays / confirmedBookings.length) * 10) / 10
      }
    }

    // Cancellation rate (all-time)
    const totalAllTime = allTimeBookings.length
    const cancelledCount = statusBreakdown.cancelled
    const cancellationRate = totalAllTime > 0 ? Math.round((cancelledCount / totalAllTime) * 1000) / 10 : 0

    // Quote acceptance rate
    let quoteAcceptanceRate = null
    {
      const totalQuotes = quoteStats.reduce((sum, g) => sum + g._count, 0)
      const acceptedQuotes = quoteStats.find(g => g.status === 'accepted')?._count || 0
      if (totalQuotes > 0) {
        quoteAcceptanceRate = Math.round((acceptedQuotes / totalQuotes) * 1000) / 10
      }
    }

    // Response time and rate from conversations
    let avgResponseTime = null
    let responseRate = null
    {
      let totalResponseMs = 0
      let responsesFound = 0
      let conversationsWithReply = 0

      recentConversations.forEach(conv => {
        if (conv.messages.length < 2) return
        const firstCustomerMsg = conv.messages.find(m => m.senderId !== vendor.userId)
        const firstVendorReply = conv.messages.find(m => m.senderId === vendor.userId && firstCustomerMsg && new Date(m.createdAt) > new Date(firstCustomerMsg.createdAt))

        if (firstCustomerMsg && firstVendorReply) {
          totalResponseMs += new Date(firstVendorReply.createdAt) - new Date(firstCustomerMsg.createdAt)
          responsesFound++
          conversationsWithReply++
        } else if (conv.messages.some(m => m.senderId === vendor.userId)) {
          conversationsWithReply++
        }
      })

      if (responsesFound > 0) {
        const avgMs = totalResponseMs / responsesFound
        const avgHours = avgMs / (1000 * 60 * 60)
        avgResponseTime = Math.round(avgHours * 10) / 10
      }
      if (recentConversations.length > 0) {
        responseRate = Math.round((conversationsWithReply / recentConversations.length) * 1000) / 10
      }
    }

    // Repeat customer rate (all-time)
    let repeatCustomerRate = 0
    {
      const customerBookings = {}
      allTimeBookings
        .filter(b => confirmedStatuses.includes(b.status) && b.customerId)
        .forEach(b => { customerBookings[b.customerId] = (customerBookings[b.customerId] || 0) + 1 })
      const uniqueCustomers = Object.keys(customerBookings).length
      const repeatCustomers = Object.values(customerBookings).filter(c => c > 1).length
      if (uniqueCustomers > 0) {
        repeatCustomerRate = Math.round((repeatCustomers / uniqueCustomers) * 1000) / 10
      }
    }

    // Upcoming revenue
    const upcomingRevenue = Math.round(parseFloat(upcomingRevenueAgg._sum.totalPrice || 0))

    return NextResponse.json({
      profileViews: currentViewsCount,
      profileViewsChange: isAllTime ? null : pctChange(currentViewsCount, prevViewsCount),
      inquiries: currentInquiries,
      inquiriesChange: isAllTime ? null : pctChange(currentInquiries, prevInquiries),
      bookings: currentBookingsCount,
      bookingsChange: isAllTime ? null : pctChange(currentBookingsCount, prevBookingsCount),
      revenue: Math.round(currentRevenue),
      revenueChange: isAllTime ? null : pctChange(currentRevenue, prevRevenue),
      avgBookingValue,
      chartData,
      topEventTypes,
      statusBreakdown,
      sourceCounts,
      peakDays,
      averageRating: vendor.averageRating ? parseFloat(vendor.averageRating) : null,
      totalReviews: vendor.totalReviews,
      // New metrics
      revenueByMonth,
      revenueByEventType,
      avgTimeToConfirm,
      cancellationRate,
      quoteAcceptanceRate,
      avgResponseTime,
      responseRate,
      repeatCustomerRate,
      upcomingRevenue,
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
