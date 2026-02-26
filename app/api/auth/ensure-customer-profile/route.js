import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Only vendors can create a customer profile' }, { status: 403 })
  }

  try {
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { customerProfile: true, vendorProfile: true },
    })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { customerProfile: true, vendorProfile: true },
      })
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (dbUser.customerProfile) {
      return NextResponse.json({ customerProfile: dbUser.customerProfile })
    }

    const fullName = dbUser.vendorProfile?.businessName || user.email?.split('@')[0] || 'Vendor'

    const customerProfile = await prisma.customerProfile.create({
      data: {
        userId: dbUser.id,
        fullName,
      },
    })

    return NextResponse.json({ customerProfile })
  } catch (err) {
    console.error('Ensure customer profile error:', err)
    return NextResponse.json({ error: 'Failed to create customer profile' }, { status: 500 })
  }
}
