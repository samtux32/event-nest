import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Only vendors can view customer reviews' }, { status: 403 })
  }

  try {
    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { vendorProfile: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, include: { vendorProfile: true } })
    }

    if (!dbUser?.vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    const reviews = await prisma.customerReview.findMany({
      where: { vendorId: dbUser.vendorProfile.id },
      include: {
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        booking: {
          select: { id: true, eventType: true, eventDate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reviews })
  } catch (err) {
    console.error('Fetch customer reviews error:', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Only vendors can review customers' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { bookingId, rating, text } = body

    if (!bookingId || !rating || !text) {
      return NextResponse.json({ error: 'bookingId, rating, and text are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 })
    }

    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { vendorProfile: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, include: { vendorProfile: true } })
    }

    if (!dbUser?.vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    // Validate booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customerReview: { select: { id: true } } },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.vendorId !== dbUser.vendorProfile.id) {
      return NextResponse.json({ error: 'This booking does not belong to you' }, { status: 403 })
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed bookings' }, { status: 400 })
    }

    if (booking.customerReview) {
      return NextResponse.json({ error: 'You have already reviewed this customer' }, { status: 400 })
    }

    // Create review and update customer average rating in a transaction
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.customerReview.create({
        data: {
          vendorId: dbUser.vendorProfile.id,
          customerId: booking.customerId,
          bookingId,
          rating,
          text,
        },
        include: {
          customer: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      })

      // Recalculate customer average rating
      const agg = await tx.customerReview.aggregate({
        where: { customerId: booking.customerId },
        _avg: { rating: true },
        _count: { rating: true },
      })

      await tx.customerProfile.update({
        where: { id: booking.customerId },
        data: {
          averageRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
          totalReviews: agg._count.rating,
        },
      })

      return created
    })

    return NextResponse.json({ review })
  } catch (err) {
    console.error('Create customer review error:', err)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
