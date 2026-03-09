import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// All possible categories in display order
const ALL_CATEGORIES = [
  'Photography', 'Videography', 'Catering', 'Florist', 'DJ',
  'Live Band/Music', 'Venue', 'Decorator/Stylist', 'Cake',
  'Wedding Planner', 'Hair & Makeup', 'Transport', 'Stationery',
  'Entertainment', 'Other',
]

export async function GET() {
  try {
    const vendors = await prisma.vendorProfile.findMany({
      where: { isApproved: true },
      select: { categories: true },
    })

    // Count vendors per category
    const counts = {}
    vendors.forEach(v => {
      v.categories.forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1
      })
    })

    // Return only categories that have at least one vendor, in display order
    const active = ALL_CATEGORIES
      .filter(cat => counts[cat] > 0)
      .map(cat => ({ name: cat, count: counts[cat] }))

    return NextResponse.json({ categories: active })
  } catch (err) {
    console.error('Categories error:', err)
    return NextResponse.json({ categories: [] })
  }
}
