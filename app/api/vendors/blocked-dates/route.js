import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET: fetch blocked dates (public with vendorId param, or authenticated vendor fetches own)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const vendorId = searchParams.get('vendorId')

  if (vendorId) {
    // Public: fetch blocked dates for a specific vendor
    try {
      const blockedDates = await prisma.blockedDate.findMany({
        where: { vendorId },
        orderBy: { date: 'asc' },
      })
      return NextResponse.json({ blockedDates })
    } catch (err) {
      console.error('Fetch blocked dates error:', err)
      return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 })
    }
  }

  // Authenticated: vendor fetches own blocked dates
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Vendor only' }, { status: 403 })
  }

  try {
    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { vendorProfile: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, include: { vendorProfile: true } })
    }

    if (!dbUser?.vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    const blockedDates = await prisma.blockedDate.findMany({
      where: { vendorId: dbUser.vendorProfile.id },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ blockedDates })
  } catch (err) {
    console.error('Fetch blocked dates error:', err)
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 })
  }
}

// POST: vendor adds a blocked date
export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Vendor only' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { date, reason } = body

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { vendorProfile: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, include: { vendorProfile: true } })
    }

    if (!dbUser?.vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        vendorId: dbUser.vendorProfile.id,
        date: new Date(date),
        reason: reason || null,
      },
    })

    return NextResponse.json({ blockedDate })
  } catch (err) {
    // Handle duplicate date
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'This date is already blocked' }, { status: 409 })
    }
    console.error('Create blocked date error:', err)
    return NextResponse.json({ error: 'Failed to block date' }, { status: 500 })
  }
}

// DELETE: vendor removes a blocked date
export async function DELETE(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Vendor only' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Blocked date ID is required' }, { status: 400 })
    }

    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { vendorProfile: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, include: { vendorProfile: true } })
    }

    if (!dbUser?.vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    // Verify the blocked date belongs to this vendor
    const existing = await prisma.blockedDate.findUnique({ where: { id } })
    if (!existing || existing.vendorId !== dbUser.vendorProfile.id) {
      return NextResponse.json({ error: 'Blocked date not found' }, { status: 404 })
    }

    await prisma.blockedDate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete blocked date error:', err)
    return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 })
  }
}
