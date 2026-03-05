import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendAccountDeletedEmail } from '@/lib/email'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find the Prisma user (by id, fallback email)
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        vendorProfile: { select: { id: true } },
        customerProfile: { select: { id: true, fullName: true } },
      },
    })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: {
          vendorProfile: { select: { id: true } },
          customerProfile: { select: { id: true, fullName: true } },
        },
      })
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const recipientName = dbUser.customerProfile?.fullName || dbUser.vendorProfile?.businessName || ''

    // Delete all user data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete notifications
      await tx.notification.deleteMany({ where: { userId: dbUser.id } })

      // Delete messages sent by this user (must come before conversations)
      await tx.message.deleteMany({ where: { senderId: dbUser.id } })

      if (dbUser.vendorProfile) {
        const vendorId = dbUser.vendorProfile.id

        // Delete vendor-specific data
        await tx.blockedDate.deleteMany({ where: { vendorId } })
        await tx.profileView.deleteMany({ where: { vendorId } })
        await tx.promotion.deleteMany({ where: { vendorId } })
        await tx.vendorFAQ.deleteMany({ where: { vendorId } })
        await tx.reviewReply.deleteMany({ where: { vendorId } })
        await tx.customerReview.deleteMany({ where: { vendorId } })
        await tx.award.deleteMany({ where: { vendorId } })
        await tx.document.deleteMany({ where: { vendorId } })
        await tx.portfolioImage.deleteMany({ where: { vendorId } })

        // Delete quotes where vendor is involved
        await tx.quote.deleteMany({ where: { vendorId } })

        // Delete bookings where vendor is involved (must delete reviews first)
        await tx.review.deleteMany({ where: { vendorId } })
        await tx.booking.deleteMany({ where: { vendorId } })

        // Delete wishlist references to this vendor
        await tx.wishlist.deleteMany({ where: { vendorId } })
        await tx.wishlistGroupVendor.deleteMany({ where: { vendorId } })

        // Delete conversations where vendor is involved (messages already deleted above)
        // First delete remaining messages in these conversations from other senders
        const vendorConvos = await tx.conversation.findMany({ where: { vendorId }, select: { id: true } })
        const convoIds = vendorConvos.map(c => c.id)
        if (convoIds.length > 0) {
          await tx.message.deleteMany({ where: { conversationId: { in: convoIds } } })
          await tx.quote.deleteMany({ where: { conversationId: { in: convoIds } } })
          await tx.conversation.deleteMany({ where: { id: { in: convoIds } } })
        }

        // Delete packages (after bookings)
        await tx.package.deleteMany({ where: { vendorId } })

        // Clear referral references pointing to this vendor
        await tx.vendorProfile.updateMany({
          where: { referredByVendorId: vendorId },
          data: { referredByVendorId: null },
        })

        await tx.vendorProfile.delete({ where: { id: vendorId } })
      }

      if (dbUser.customerProfile) {
        const customerId = dbUser.customerProfile.id

        // Delete customer-specific data
        await tx.customerReview.deleteMany({ where: { customerId } })
        await tx.wishlist.deleteMany({ where: { customerId } })
        await tx.wishlistGroupVendor.deleteMany({
          where: { group: { customerId } },
        })
        await tx.wishlistGroup.deleteMany({ where: { customerId } })
        await tx.checklistItem.deleteMany({
          where: { checklist: { customerId } },
        })
        await tx.checklist.deleteMany({ where: { customerId } })
        await tx.savedPlan.deleteMany({ where: { customerId } })

        // Delete quotes where customer is involved
        await tx.quote.deleteMany({ where: { customerId } })

        // Delete reviews by this customer
        await tx.review.deleteMany({ where: { customerId } })

        // Delete bookings where customer is involved
        await tx.booking.deleteMany({ where: { customerId } })

        // Delete conversations where customer is involved
        const customerConvos = await tx.conversation.findMany({ where: { customerId }, select: { id: true } })
        const convoIds = customerConvos.map(c => c.id)
        if (convoIds.length > 0) {
          await tx.message.deleteMany({ where: { conversationId: { in: convoIds } } })
          await tx.quote.deleteMany({ where: { conversationId: { in: convoIds } } })
          await tx.conversation.deleteMany({ where: { id: { in: convoIds } } })
        }

        // Delete events
        await tx.event.deleteMany({ where: { customerId } })

        await tx.customerProfile.delete({ where: { id: customerId } })
      }

      // Delete push subscriptions if they exist
      try {
        await tx.pushSubscription.deleteMany({ where: { userId: dbUser.id } })
      } catch {
        // Table may not exist yet
      }

      // Finally delete the user record
      await tx.user.delete({ where: { id: dbUser.id } })
    })

    // Delete from Supabase Auth using service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey) {
      const adminClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      await adminClient.auth.admin.deleteUser(user.id)
    }

    // Send confirmation email (fire-and-forget)
    sendAccountDeletedEmail({
      recipientEmail: user.email,
      recipientName,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Account deletion error:', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
