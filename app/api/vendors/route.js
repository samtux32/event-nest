import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  try {
    const where = { isApproved: true }

    if (category && category !== 'All Categories') {
      where.category = category
    }

    if (search) {
      // First, find vendor IDs whose keywords partially match the search term
      const keywordMatchIds = await prisma.$queryRaw`
        SELECT id::text FROM vendor_profiles
        WHERE EXISTS (
          SELECT 1 FROM unnest(keywords) AS kw
          WHERE kw ILIKE ${'%' + search + '%'}
        )
      `.then(rows => rows.map(r => r.id))

      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        ...(keywordMatchIds.length > 0 ? [{ id: { in: keywordMatchIds } }] : []),
      ]
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
      lat: v.latitude,
      lng: v.longitude,
      startingPrice: v.packages[0]
        ? `£${Number(v.packages[0].price).toLocaleString('en-GB')}`
        : null,
      description: v.tagline || (v.description ? v.description.slice(0, 80) + '...' : ''),
      keywords: v.keywords || [],
    }))

    return NextResponse.json({ vendors: mapped })
  } catch (err) {
    console.error('Vendors list error:', err)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}
