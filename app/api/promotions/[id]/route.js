import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function getVendorProfile(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const dbUser = await prisma.user.findFirst({
    where: { OR: [{ id: user.id }, { email: user.email }] },
    include: { vendorProfile: { select: { id: true } } },
  })
  return dbUser?.vendorProfile || null
}

// PUT — update a promotion
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const vp = await getVendorProfile(supabase)
    if (!vp) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 403 })

    const existing = await prisma.promotion.findUnique({ where: { id } })
    if (!existing || existing.vendorId !== vp.id) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    const body = await request.json()
    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.discountText !== undefined && { discountText: body.discountText?.trim() || null }),
        ...(body.validFrom !== undefined && { validFrom: body.validFrom ? new Date(body.validFrom) : null }),
        ...(body.validUntil !== undefined && { validUntil: body.validUntil ? new Date(body.validUntil) : null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })
    return NextResponse.json({ promotion })
  } catch (err) {
    console.error('Promotions PUT error:', err)
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 })
  }
}

// DELETE — remove a promotion
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const vp = await getVendorProfile(supabase)
    if (!vp) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 403 })

    const existing = await prisma.promotion.findUnique({ where: { id } })
    if (!existing || existing.vendorId !== vp.id) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    await prisma.promotion.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Promotions DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 })
  }
}
