import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 })
  }

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      include: {
        packages: { orderBy: { sortOrder: 'asc' } },
        portfolioImages: { orderBy: { sortOrder: 'asc' } },
        awards: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { fullName: true } },
            reply: true,
          }
        }
      }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Allow vendors to preview their own unapproved profile
    if (!vendor.isApproved) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const isOwner = user && user.id === vendor.userId

      if (!isOwner) {
        return NextResponse.json({ error: 'This vendor profile is not available' }, { status: 403 })
      }
    }

    return NextResponse.json({ vendor })
  } catch (err) {
    console.error('Vendor fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch vendor profile' }, { status: 500 })
  }
}
