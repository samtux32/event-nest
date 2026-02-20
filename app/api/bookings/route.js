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
    return NextResponse.json({ error: 'Only customers can create bookings' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { customerProfile: true },
    })

    if (!dbUser?.customerProfile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    const customerId = dbUser.customerProfile.id

    // Look up package price
    let totalPrice = null
    let vendorFee = null
    let customerFee = null

    if (body.packageId) {
      const pkg = await prisma.package.findUnique({ where: { id: body.packageId } })
      if (pkg) {
        totalPrice = Number(pkg.price)
        vendorFee = Math.round(totalPrice * 0.10 * 100) / 100
        customerFee = Math.round(totalPrice * 0.02 * 100) / 100
      }
    }

    const booking = await prisma.booking.create({
      data: {
        vendorId: body.vendorId,
        customerId,
        packageId: body.packageId || null,
        eventDate: body.eventDate ? new Date(body.eventDate) : null,
        eventType: body.eventType || null,
        guestCount: body.guestCount ? parseInt(body.guestCount) : null,
        venueName: body.venueName || null,
        venueAddress: body.venueAddress || null,
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        additionalServices: body.additionalServices || [],
        specialRequests: body.specialRequests || null,
        contactName: body.contactName || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        hearAbout: body.hearAbout || null,
        status: 'new_inquiry',
        totalPrice,
        vendorFee,
        customerFee,
      },
    })

    // Upsert conversation for this vendor-customer pair
    // If conversation already exists, link it to this booking (so date proposals work)
    const conversation = await prisma.conversation.upsert({
      where: {
        vendorId_customerId: {
          vendorId: body.vendorId,
          customerId,
        },
      },
      update: { bookingId: booking.id },
      create: {
        vendorId: body.vendorId,
        customerId,
        bookingId: booking.id,
      },
    })

    // Notify the vendor of the new inquiry
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: body.vendorId },
      include: { user: true },
    })
    if (vendor?.user) {
      await prisma.notification.create({
        data: {
          userId: vendor.user.id,
          type: 'new_inquiry',
          title: 'New booking inquiry',
          body: `${dbUser.customerProfile.fullName || 'A customer'} has sent you a quote request.`,
          link: '/',
        },
      })
    }

    return NextResponse.json({ booking, conversationId: conversation.id })
  } catch (err) {
    console.error('Create booking error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

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
        customerProfile: role === 'customer',
        vendorProfile: role === 'vendor',
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profileId = role === 'vendor'
      ? dbUser.vendorProfile?.id
      : dbUser.customerProfile?.id

    if (!profileId) {
      return NextResponse.json({ bookings: [] })
    }

    const where = role === 'vendor'
      ? { vendorId: profileId }
      : { customerId: profileId }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vendor: {
          select: { id: true, businessName: true, profileImageUrl: true, category: true },
        },
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        package: {
          select: { id: true, name: true, price: true },
        },
        conversation: {
          select: { id: true },
        },
        review: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ bookings })
  } catch (err) {
    console.error('Fetch bookings error:', err)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function PUT(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Only vendors can update booking status' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { bookingId, status } = body

    if (!bookingId || !['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid bookingId or status' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { vendorProfile: true },
    })

    if (!dbUser?.vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    // Verify booking belongs to this vendor
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || booking.vendorId !== dbUser.vendorProfile.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        ...(status === 'confirmed' ? { confirmedAt: new Date() } : {}),
      },
      include: { customer: { include: { user: true } } },
    })

    // Notify the customer when booking is confirmed or cancelled
    if (status === 'confirmed' || status === 'cancelled') {
      const customerUserId = updated.customer?.user?.id
      if (customerUserId) {
        await prisma.notification.create({
          data: {
            userId: customerUserId,
            type: status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled',
            title: status === 'confirmed' ? 'Booking confirmed! 🎉' : 'Booking cancelled',
            body: status === 'confirmed'
              ? `${dbUser.vendorProfile.businessName} has confirmed your booking.`
              : `${dbUser.vendorProfile.businessName} has cancelled your booking.`,
            link: '/my-bookings',
          },
        })
      }
    }

    return NextResponse.json({ booking: updated })
  } catch (err) {
    console.error('Update booking error:', err)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
