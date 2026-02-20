import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// POST — customer cancels a booking
export async function POST(request, { params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'customer') {
    return NextResponse.json({ error: 'Customers only' }, { status: 403 })
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { customerProfile: true },
    })

    if (!dbUser?.customerProfile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vendor: { include: { user: true } },
        conversation: true,
      },
    })

    if (!booking || booking.customerId !== dbUser.customerProfile.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!['new_inquiry', 'pending'].includes(booking.status)) {
      return NextResponse.json({ error: 'This booking cannot be cancelled' }, { status: 400 })
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    })

    // Notify the vendor
    const vendorUserId = booking.vendor?.user?.id
    if (vendorUserId) {
      await prisma.notification.create({
        data: {
          userId: vendorUserId,
          type: 'booking_cancelled',
          title: 'Booking cancelled by customer',
          body: `${dbUser.customerProfile.fullName || 'A customer'} has cancelled their booking.`,
          link: `/`,
        },
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Cancel booking error:', err)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
