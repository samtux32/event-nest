import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendNewReviewEmail } from '@/lib/email'
import { createReviewSchema } from '@/lib/validation/reviewSchemas'
import { validateBody } from '@/lib/validation/helpers'

// Public endpoint: fetch all reviews for a vendor (no auth required)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const vendorId = searchParams.get('vendorId')
  const rating = searchParams.get('rating')

  if (!vendorId) {
    return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
  }

  try {
    const where = {
      vendorId,
      ...(rating ? { rating: parseInt(rating) } : {}),
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { fullName: true } },
        reply: true,
      },
    })

    return NextResponse.json({ reviews })
  } catch (err) {
    console.error('Reviews fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const role = user.user_metadata?.role
  if (role !== 'customer' && role !== 'vendor') return NextResponse.json({ error: 'Customers only' }, { status: 403 })

  const { data: body, response: validationError } = await validateBody(request, createReviewSchema)
  if (validationError) return validationError

  const { bookingId, rating, text, photos } = body

  try {
    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { customerProfile: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, include: { customerProfile: true } })
    }
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

    const vendor = await prisma.vendorProfile.update({
      where: { id: booking.vendorId },
      data: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
      },
      include: { user: { select: { email: true } } },
    })

    // Email the vendor about the new review
    if (vendor?.user?.email) {
      sendNewReviewEmail({
        vendorEmail: vendor.user.email,
        vendorName: vendor.businessName,
        customerName: dbUser.customerProfile.fullName || 'A customer',
        rating,
        reviewText: text,
      }).catch(() => {})
    }

    return NextResponse.json({ review })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'You have already reviewed this booking' }, { status: 409 })
    }
    console.error('Review create error:', err)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
