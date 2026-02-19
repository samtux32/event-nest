import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    const where = { isApproved: true }

    if (category && category !== 'All Categories') {
      where.category = category
    }

    const vendors = await prisma.vendorProfile.findMany({
      where,
      include: {
        packages: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      orderBy: { averageRating: 'desc' },
    })

    const mapped = vendors.map((v) => ({
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

    return NextResponse.json({ vendors: mapped })
  } catch (err) {
    console.error('Vendors list error:', err)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}
