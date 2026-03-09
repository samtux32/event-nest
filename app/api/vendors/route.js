import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const categories = searchParams.get('categories')
  const rawSearch = searchParams.get('search')
  const search = rawSearch ? rawSearch.trim().slice(0, 200) : null
  const limit = Math.min(parseInt(searchParams.get('limit')) || 24, 100)
  const offset = parseInt(searchParams.get('offset')) || 0

  try {
    const where = { isApproved: true }

    if (categories) {
      const list = categories.split(',').map(c => c.trim()).filter(Boolean).slice(0, 20)
      if (list.length > 0) {
        where.categories = { hasSome: list }
      }
    }

    if (search) {
      // Parameterized query — search term is safely passed as a Prisma parameter
      const searchPattern = `%${search}%`
      const keywordMatchIds = await prisma.$queryRaw`
        SELECT id::text FROM vendor_profiles
        WHERE EXISTS (
          SELECT 1 FROM unnest(keywords) AS kw
          WHERE kw ILIKE ${searchPattern}
        )
      `.then(rows => rows.map(r => r.id))

      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { categories: { hasSome: [search] } },
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
      take: limit + 1,
      skip: offset,
    })

    const hasMore = vendors.length > limit
    if (hasMore) vendors.pop()

    const mapped = vendors.map((v) => ({
      id: v.id,
      name: v.businessName,
      category: v.categories?.join(', ') || '',
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

    return NextResponse.json({ vendors: mapped, hasMore })
  } catch (err) {
    console.error('Vendors list error:', err)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}
