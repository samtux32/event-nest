import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function assertAdmin(supabase) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  if (user.user_metadata?.role !== 'admin') return null
  return user
}

// GET /api/admin/reviews — fetch all reviews with customer + vendor info
export async function GET(request) {
  const supabase = await createClient()
  const user = await assertAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const flaggedOnly = searchParams.get('flagged') === 'true'

  try {
    const reviews = await prisma.review.findMany({
      where: flaggedOnly ? { isFlagged: true } : {},
      include: {
        customer: { select: { fullName: true } },
        vendor: { select: { businessName: true, category: true } },
      },
      orderBy: [{ isFlagged: 'desc' }, { createdAt: 'desc' }],
    })

    const mapped = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      photos: r.photos,
      eventDate: r.eventDate,
      isFlagged: r.isFlagged,
      createdAt: r.createdAt,
      customerName: r.customer?.fullName || 'Unknown',
      vendorName: r.vendor?.businessName || 'Unknown',
      vendorCategory: r.vendor?.category || '',
      vendorId: r.vendorId,
    }))

    return NextResponse.json({ reviews: mapped })
  } catch (err) {
    console.error('Admin reviews fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// PUT /api/admin/reviews — flag or unflag a review
export async function PUT(request) {
  const supabase = await createClient()
  const user = await assertAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { reviewId, isFlagged } = await request.json()
    if (!reviewId || typeof isFlagged !== 'boolean') {
      return NextResponse.json({ error: 'reviewId and isFlagged are required' }, { status: 400 })
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isFlagged },
    })

    return NextResponse.json({ review: { id: review.id, isFlagged: review.isFlagged } })
  } catch (err) {
    console.error('Admin review flag error:', err)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

// DELETE /api/admin/reviews — permanently delete a review
export async function DELETE(request) {
  const supabase = await createClient()
  const user = await assertAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { reviewId } = await request.json()
    if (!reviewId) return NextResponse.json({ error: 'reviewId is required' }, { status: 400 })

    // Fetch vendor before deleting so we can recalculate rating
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { vendorId: true },
    })
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    await prisma.review.delete({ where: { id: reviewId } })

    // Recalculate vendor average rating
    const remaining = await prisma.review.findMany({
      where: { vendorId: review.vendorId },
      select: { rating: true },
    })
    const avg = remaining.length
      ? Math.round((remaining.reduce((s, r) => s + r.rating, 0) / remaining.length) * 10) / 10
      : 0

    await prisma.vendorProfile.update({
      where: { id: review.vendorId },
      data: { averageRating: avg, totalReviews: remaining.length },
    })

    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('Admin review delete error:', err)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
