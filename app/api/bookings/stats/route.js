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
    return NextResponse.json({ error: 'Only vendors can access stats' }, { status: 403 })
  }

  try {
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { vendorProfile: true },
    })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { vendorProfile: true },
      })
    }

    if (!dbUser?.vendorProfile) {
      return NextResponse.json({ newInquiries: 0, upcomingBookings: 0, completedEvents: 0, totalRevenue: 0 })
    }

    const vendorId = dbUser.vendorProfile.id

    const [newInquiries, upcomingBookings, completedEvents, revenueResult] = await Promise.all([
      prisma.booking.count({ where: { vendorId, status: 'new_inquiry' } }),
      prisma.booking.count({ where: { vendorId, status: 'confirmed' } }),
      prisma.booking.count({ where: { vendorId, status: 'completed' } }),
      prisma.booking.aggregate({
        where: { vendorId, status: { in: ['confirmed', 'completed'] } },
        _sum: { totalPrice: true },
      }),
    ])

    return NextResponse.json({
      newInquiries,
      upcomingBookings,
      completedEvents,
      totalRevenue: Number(revenueResult._sum.totalPrice || 0),
    })
  } catch (err) {
    console.error('Bookings stats error:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
