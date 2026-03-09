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

// Toggle done or delete item
export async function PATCH(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const profile = await getCustomerProfile(user.id, user.email)
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { id, itemId } = await params
    const checklist = await prisma.checklist.findUnique({ where: { id } })
    if (!checklist || checklist.customerId !== profile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { done } = await request.json()
    const item = await prisma.checklistItem.update({
      where: { id: itemId, checklistId: id },
      data: { done },
    })

    return NextResponse.json({ item })
  } catch (err) {
    console.error('PATCH /api/checklists/[id]/items/[itemId] error:', err)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const profile = await getCustomerProfile(user.id, user.email)
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { id, itemId } = await params
    const checklist = await prisma.checklist.findUnique({ where: { id } })
    if (!checklist || checklist.customerId !== profile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.checklistItem.delete({ where: { id: itemId, checklistId: id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/checklists/[id]/items/[itemId] error:', err)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
