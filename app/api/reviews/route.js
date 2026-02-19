import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (user.user_metadata?.role !== 'customer') return NextResponse.json({ error: 'Customers only' }, { status: 403 })

  try {
    const { bookingId, rating, text, photos } = await request.json()

    if (!bookingId || !rating || !text) {
      return NextResponse.json({ error: 'bookingId, rating, and text are required' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { customerProfile: true },
    })
    if (!dbUser?.customerProfile) return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })

    // Verify booking belongs to this customer and is completed
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || booking.customerId !== dbUser.customerProfile.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed bookings' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        vendorId: booking.vendorId,
        customerId: dbUser.customerProfile.id,
        bookingId,
        rating,
        text,
        photos: photos || [],
        eventDate: booking.eventDate
          ? new Date(booking.eventDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
          : null,
      },
    })

    // Update vendor's average rating and review count
    const allReviews = await prisma.review.findMany({
      where: { vendorId: booking.vendorId },
      select: { rating: true },
    })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.vendorProfile.update({
      where: { id: booking.vendorId },
      data: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    })

    return NextResponse.json({ review })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'You have already reviewed this booking' }, { status: 409 })
    }
    console.error('Review create error:', err)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
