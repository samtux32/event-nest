import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (user.user_metadata?.role !== 'vendor') return NextResponse.json({ error: 'Vendors only' }, { status: 403 })

  const { reviewId } = await params
  const { text } = await request.json()

  if (!text?.trim()) return NextResponse.json({ error: 'Reply text is required' }, { status: 400 })

  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    // Verify the review belongs to this vendor
    const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { vendorId: true } })
    if (!review || review.vendorId !== vendor.id) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const reply = await prisma.reviewReply.create({
      data: { reviewId, vendorId: vendor.id, text: text.trim() },
    })

    return NextResponse.json({ reply })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'You have already replied to this review' }, { status: 409 })
    }
    console.error('Review reply error:', err)
    return NextResponse.json({ error: 'Failed to submit reply' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (user.user_metadata?.role !== 'vendor') return NextResponse.json({ error: 'Vendors only' }, { status: 403 })

  const { reviewId } = await params

  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.id }, select: { id: true } })
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    await prisma.reviewReply.deleteMany({ where: { reviewId, vendorId: vendor.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Review reply delete error:', err)
    return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 })
  }
}
