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

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const full = searchParams.get('full') === 'true'

  try {
    const profile = await getCustomerProfile(user.id)
    if (!profile) return NextResponse.json({ vendorIds: [], vendors: [] })

    if (full) {
      const wishlists = await prisma.wishlist.findMany({
        where: { customerId: profile.id },
        include: {
          vendor: {
            include: {
              packages: { orderBy: { sortOrder: 'asc' }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const vendors = wishlists.map(({ vendor: v }) => ({
        id: v.id,
        name: v.businessName,
        category: v.category,
        image: v.profileImageUrl,
        rating: v.averageRating ? Number(v.averageRating) : null,
        reviews: v.totalReviews,
        location: v.location,
        startingPrice: v.packages[0]
          ? `£${Number(v.packages[0].price).toLocaleString('en-GB')}`
          : null,
        description: v.tagline || (v.description ? v.description.slice(0, 80) + '...' : ''),
      }))

      return NextResponse.json({ vendors })
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { customerId: profile.id },
      select: { vendorId: true },
    })

    return NextResponse.json({ vendorIds: wishlists.map(w => w.vendorId) })
  } catch (err) {
    console.error('Wishlist fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (user.user_metadata?.role !== 'customer') return NextResponse.json({ error: 'Customers only' }, { status: 403 })

  try {
    const { vendorId } = await request.json()
    const profile = await getCustomerProfile(user.id)
    if (!profile) return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })

    const existing = await prisma.wishlist.findFirst({
      where: { customerId: profile.id, vendorId, eventId: null },
    })
    if (!existing) {
      await prisma.wishlist.create({ data: { customerId: profile.id, vendorId } })
    }

    return NextResponse.json({ wishlisted: true })
  } catch (err) {
    console.error('Wishlist add error:', err)
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const { vendorId } = await request.json()
    const profile = await getCustomerProfile(user.id)
    if (!profile) return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })

    await prisma.wishlist.deleteMany({
      where: { customerId: profile.id, vendorId },
    })

    return NextResponse.json({ wishlisted: false })
  } catch (err) {
    console.error('Wishlist remove error:', err)
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
