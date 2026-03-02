import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'customer') {
    return NextResponse.json({ error: 'Only customers can become vendors' }, { status: 403 })
  }

  const { businessName } = await request.json()

  if (!businessName?.trim()) {
    return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
  }

  try {
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { vendorProfile: true },
    })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { vendorProfile: true },
      })
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If vendor profile already exists, return it
    if (dbUser.vendorProfile) {
      return NextResponse.json({ vendorProfile: dbUser.vendorProfile })
    }

    // Create vendor profile and update role in a transaction
    const vendorProfile = await prisma.$transaction(async (tx) => {
      const vp = await tx.vendorProfile.create({
        data: {
          userId: dbUser.id,
          businessName: businessName.trim(),
          isApproved: false,
          profileCompletion: 0,
        },
      })

      await tx.user.update({
        where: { id: dbUser.id },
        data: { role: 'vendor' },
      })

      return vp
    })

    // Update Supabase Auth metadata
    await supabase.auth.updateUser({
      data: { role: 'vendor' },
    })

    return NextResponse.json({ vendorProfile })
  } catch (err) {
    console.error('Become vendor error:', err)
    return NextResponse.json({ error: 'Failed to create vendor profile' }, { status: 500 })
  }
}
