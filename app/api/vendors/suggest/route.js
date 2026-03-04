import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

const CATEGORIES = [
  'Catering', 'Photography', 'Videography', 'Florist', 'DJ',
  'Live Band/Music', 'Venue', 'Decorator/Stylist', 'Cake',
]

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [], categories: [] })
  }

  try {
    const vendors = await prisma.vendorProfile.findMany({
      where: {
        isApproved: true,
        businessName: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, businessName: true, categories: true },
      take: 5,
      orderBy: { averageRating: 'desc' },
    })

    const matchedCategories = CATEGORIES.filter(c =>
      c.toLowerCase().includes(q.toLowerCase())
    )

    return NextResponse.json({
      suggestions: vendors.map(v => ({ id: v.id, name: v.businessName, category: v.categories?.[0] || null })),
      categories: matchedCategories,
    })
  } catch (err) {
    console.error('Suggest error:', err)
    return NextResponse.json({ suggestions: [], categories: [] })
  }
}
