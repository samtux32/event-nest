import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  if (user.user_metadata?.role !== 'admin') return null
  return user
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const vendors = await prisma.vendorProfile.findMany({
      include: {
        user: { select: { email: true, createdAt: true } },
        documents: { select: { id: true, fileName: true, fileType: true, fileUrl: true, fileSize: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ vendors })
  } catch (err) {
    console.error('Admin vendors fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

export async function PUT(request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { vendorId, isApproved, verificationStatus } = await request.json()

    if (!vendorId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const data = {}
    if (typeof isApproved === 'boolean') data.isApproved = isApproved
    if (verificationStatus) data.verificationStatus = verificationStatus

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const vendor = await prisma.vendorProfile.update({
      where: { id: vendorId },
      data,
    })

    return NextResponse.json({ vendor })
  } catch (err) {
    console.error('Admin vendor update error:', err)
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 })
  }
}
