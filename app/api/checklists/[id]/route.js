import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function getCustomerProfile(userId, email) {
  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { customerProfile: true },
  })
  if (!dbUser && email) {
    dbUser = await prisma.user.findUnique({
      where: { email },
      include: { customerProfile: true },
    })
  }
  return dbUser?.customerProfile
}

export async function DELETE(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const profile = await getCustomerProfile(user.id, user.email)
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { id } = await params
    const existing = await prisma.checklist.findUnique({ where: { id } })
    if (!existing || existing.customerId !== profile.id) {
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 })
    }

    await prisma.checklist.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/checklists/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete checklist' }, { status: 500 })
  }
}
