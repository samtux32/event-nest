import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const metaRole = user.user_metadata?.role

  try {
    // Try by Supabase auth ID first, then fall back to email
    // First do a lightweight lookup to get the DB role
    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { role: true } })
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    // Use DB role as source of truth, fall back to Supabase metadata
    const role = dbUser.role || metaRole

    const include = {
      customerProfile: role === 'customer' || role === 'vendor' ? true : false,
      vendorProfile: role === 'vendor' ? {
        include: {
          packages: { orderBy: { sortOrder: 'asc' } },
          portfolioImages: { orderBy: { sortOrder: 'asc' } },
          documents: true,
        },
      } : false,
    }

    let fullUser = await prisma.user.findUnique({ where: { id: user.id }, include })
    if (!fullUser) {
      fullUser = await prisma.user.findUnique({ where: { email: user.email }, include })
    }

    const profile = role === 'vendor' ? fullUser.vendorProfile : fullUser.customerProfile

    return NextResponse.json({
      profile: {
        ...profile,
        email: fullUser.email,
        role,
      },
      ...(role === 'vendor' ? { customerProfile: fullUser.customerProfile || null } : {}),
    })
  } catch (err) {
    console.error('Profile fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
