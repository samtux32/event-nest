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

// GET — list promotions for the logged-in vendor
export async function GET() {
  try {
    const supabase = await createClient()
    const vp = await getVendorProfile(supabase)
    if (!vp) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 403 })

    const promotions = await prisma.promotion.findMany({
      where: { vendorId: vp.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ promotions })
  } catch (err) {
    console.error('Promotions GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}

// POST — create a new promotion
export async function POST(request) {
  try {
    const supabase = await createClient()
    const vp = await getVendorProfile(supabase)
    if (!vp) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 403 })

    const body = await request.json()
    const { title, description, discountText, validFrom, validUntil } = body
    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const promotion = await prisma.promotion.create({
      data: {
        vendorId: vp.id,
        title: title.trim(),
        description: description?.trim() || null,
        discountText: discountText?.trim() || null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    })
    return NextResponse.json({ promotion }, { status: 201 })
  } catch (err) {
    console.error('Promotions POST error:', err)
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
  }
}
