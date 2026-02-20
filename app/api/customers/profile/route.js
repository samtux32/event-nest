import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'customer') {
    return NextResponse.json({ error: 'Not a customer' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
    })

    if (!customerProfile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    const updated = await prisma.customerProfile.update({
      where: { id: customerProfile.id },
      data: {
        ...(body.fullName !== undefined ? { fullName: body.fullName } : {}),
      },
    })

    return NextResponse.json({ profile: updated })
  } catch (err) {
    console.error('Customer profile save error:', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
