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

    // Case 1: no DB user at all — create user + profile
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
            ? { vendorProfile: { create: { businessName: 'My Business', category: 'Other', isApproved: true } } }
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

    // Case 2: user exists but profile record is missing (partial registration failure)
    if (!profile && (role === 'vendor' || role === 'customer')) {
      if (role === 'vendor') {
        profile = await prisma.vendorProfile.create({
          data: { userId: user.id, businessName: 'My Business', category: 'Other', isApproved: true },
          include: { packages: true, portfolioImages: true, documents: true },
        })
      } else {
        profile = await prisma.customerProfile.create({
          data: { userId: user.id, fullName: user.email.split('@')[0] },
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
