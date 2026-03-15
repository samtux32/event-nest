import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const role = user.user_metadata?.role
  if (role !== 'vendor') {
    return NextResponse.json({ error: 'Only vendors can access dashboard' }, { status: 403 })
  }

  try {
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { vendorProfile: { include: { packages: true } } },
    })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { vendorProfile: { include: { packages: true } } },
      })
    }

    if (!dbUser?.vendorProfile) {
      return NextResponse.json({
        stats: { newInquiries: 0, upcomingBookings: 0, completedEvents: 0, totalRevenue: 0 },
        bookings: [],
        hasMore: false,
        vendor: null,
      })
    }

    const vendorId = dbUser.vendorProfile.id
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100)
    const offset = parseInt(url.searchParams.get('offset')) || 0

    const [newInquiries, upcomingBookings, completedEvents, revenueResult, bookings] = await Promise.all([
      prisma.booking.count({ where: { vendorId, status: 'new_inquiry' } }),
      prisma.booking.count({ where: { vendorId, status: 'confirmed' } }),
      prisma.booking.count({ where: { vendorId, status: 'completed' } }),
      prisma.booking.aggregate({
        where: { vendorId, status: { in: ['confirmed', 'completed'] } },
        _sum: { totalPrice: true },
      }),
      prisma.booking.findMany({
        where: { vendorId },
        include: {
          vendor: { select: { id: true, businessName: true, profileImageUrl: true, categories: true } },
          customer: { select: { id: true, fullName: true, avatarUrl: true } },
          package: { select: { id: true, name: true, price: true } },
          conversation: { select: { id: true } },
          review: { select: { id: true } },
          customerReview: { select: { id: true } },
          savedPlan: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        skip: offset,
      }),
    ])

    const hasMore = bookings.length > limit
    if (hasMore) bookings.pop()

    const vendor = dbUser.vendorProfile

    const response = NextResponse.json({
      stats: {
        newInquiries,
        upcomingBookings,
        completedEvents,
        totalRevenue: Number(revenueResult._sum.totalPrice || 0),
      },
      bookings,
      hasMore,
      vendor,
    })

    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30')
    return response
  } catch (err) {
    console.error('Vendor dashboard error:', err)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
