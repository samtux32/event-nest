import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function getCustomerProfile(userId) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { customerProfile: true },
  })
  return dbUser?.customerProfile
}

// GET /api/wishlist/groups — fetch all groups with their vendor IDs
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const profile = await getCustomerProfile(user.id)
    if (!profile) return NextResponse.json({ groups: [] })

    const groups = await prisma.wishlistGroup.findMany({
      where: { customerId: profile.id },
      include: {
        vendors: { select: { vendorId: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      groups: groups.map(g => ({
        id: g.id,
        name: g.name,
        vendorIds: g.vendors.map(v => v.vendorId),
      })),
    })
  } catch (err) {
    console.error('Wishlist groups fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

// POST /api/wishlist/groups — create a new group
export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const { name } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const profile = await getCustomerProfile(user.id)
    if (!profile) return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })

    const group = await prisma.wishlistGroup.create({
      data: { customerId: profile.id, name: name.trim() },
    })

    return NextResponse.json({ group: { id: group.id, name: group.name, vendorIds: [] } })
  } catch (err) {
    console.error('Wishlist group create error:', err)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
