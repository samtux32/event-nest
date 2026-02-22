import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true } })
    }
    const dbUserId = dbUser?.id ?? user.id

    const notifications = await prisma.notification.findMany({
      where: { userId: dbUserId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    const unreadCount = notifications.filter(n => !n.isRead).length
    return NextResponse.json({ notifications, unreadCount })
  } catch (err) {
    console.error('Notifications fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PUT(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true } })
    }
    const dbUserId = dbUser?.id ?? user.id

    const { notificationId } = await request.json()
    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId, userId: dbUserId },
        data: { isRead: true },
      })
    } else {
      await prisma.notification.updateMany({
        where: { userId: dbUserId, isRead: false },
        data: { isRead: true },
      })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Notification update error:', err)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
