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
    let dbUser = await prisma.user.findUnique({
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

    // If not found by Supabase auth ID, fall back to finding by email
    // (handles the case where user re-registered with same email, creating a new auth account)
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: user.email },
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
    }

    // Still no user — create one fresh
    if (!dbUser) {
      if (!role || (role !== 'customer' && role !== 'vendor')) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
      }
      const created = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          role,
          ...(role === 'vendor'
            ? { vendorProfile: { create: { businessName: 'My Business', category: 'Other' } } }
            : { customerProfile: { create: { fullName: user.email.split('@')[0] } } }
          ),
        },
        include: {
          customerProfile: role === 'customer' ? true : false,
          vendorProfile: role === 'vendor' ? { include: { packages: true, portfolioImages: true, documents: true } } : false,
        },
      })
      const createdProfile = role === 'vendor' ? created.vendorProfile : created.customerProfile
      return NextResponse.json({ profile: { ...createdProfile, email: created.email, role: created.role } })
    }

    let profile = role === 'vendor' ? dbUser.vendorProfile : dbUser.customerProfile

    // Profile record missing — create it now
    if (!profile && (role === 'vendor' || role === 'customer')) {
      if (role === 'vendor') {
        profile = await prisma.vendorProfile.create({
          data: { userId: dbUser.id, businessName: 'My Business', category: 'Other' },
          include: { packages: true, portfolioImages: true, documents: true },
        })
      } else {
        profile = await prisma.customerProfile.create({
          data: { userId: dbUser.id, fullName: user.email.split('@')[0] },
        })
      }
    }

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
