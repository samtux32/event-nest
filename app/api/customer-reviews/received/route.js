import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { customerProfile: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, include: { customerProfile: true } })
    }

    if (!dbUser?.customerProfile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    const reviews = await prisma.customerReview.findMany({
      where: { customerId: dbUser.customerProfile.id },
      include: {
        vendor: {
          select: { id: true, businessName: true, profileImageUrl: true },
        },
        booking: {
          select: { id: true, eventType: true, eventDate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reviews })
  } catch (err) {
    console.error('Fetch received customer reviews error:', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
