import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const role = user.user_metadata?.role

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        customerProfile: role === 'customer' ? true : false,
        vendorProfile: role === 'vendor' ? {
          include: {
            packages: { orderBy: { sortOrder: 'asc' } },
            portfolioImages: { orderBy: { sortOrder: 'asc' } },
            documents: true,
          },
        } : false,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const profile = role === 'vendor' ? dbUser.vendorProfile : dbUser.customerProfile

    return NextResponse.json({
      profile: {
        ...profile,
        email: dbUser.email,
        role: dbUser.role,
      },
    })
  } catch (err) {
    console.error('Profile fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
