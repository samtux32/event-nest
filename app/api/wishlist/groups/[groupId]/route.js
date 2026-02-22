import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// DELETE /api/wishlist/groups/[groupId] — delete a group
export async function DELETE(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { groupId } = await params

  try {
    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { customerProfile: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, include: { customerProfile: true } })
    }
    const profile = dbUser?.customerProfile
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Ensure group belongs to this customer
    const group = await prisma.wishlistGroup.findUnique({ where: { id: groupId } })
    if (!group || group.customerId !== profile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.wishlistGroup.delete({ where: { id: groupId } })
    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('Wishlist group delete error:', err)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
