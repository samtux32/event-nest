import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function getCustomerProfile(userId) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { customerProfile: true },
  })
  return dbUser?.customerProfile
}

async function assertGroupOwnership(groupId, customerId) {
  const group = await prisma.wishlistGroup.findUnique({ where: { id: groupId } })
  return group?.customerId === customerId ? group : null
}

// POST /api/wishlist/groups/[groupId]/vendors — add vendor to group
export async function POST(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { groupId } = await params

  try {
    const { vendorId } = await request.json()
    const profile = await getCustomerProfile(user.id)
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const group = await assertGroupOwnership(groupId, profile.id)
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

    await prisma.wishlistGroupVendor.upsert({
      where: { groupId_vendorId: { groupId, vendorId } },
      update: {},
      create: { groupId, vendorId },
    })

    return NextResponse.json({ added: true })
  } catch (err) {
    console.error('Group vendor add error:', err)
    return NextResponse.json({ error: 'Failed to add vendor to group' }, { status: 500 })
  }
}

// DELETE /api/wishlist/groups/[groupId]/vendors — remove vendor from group
export async function DELETE(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { groupId } = await params

  try {
    const { vendorId } = await request.json()
    const profile = await getCustomerProfile(user.id)
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const group = await assertGroupOwnership(groupId, profile.id)
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

    await prisma.wishlistGroupVendor.deleteMany({
      where: { groupId, vendorId },
    })

    return NextResponse.json({ removed: true })
  } catch (err) {
    console.error('Group vendor remove error:', err)
    return NextResponse.json({ error: 'Failed to remove vendor from group' }, { status: 500 })
  }
}
