// Run with: node scripts/clean-demo.js
// Removes ALL demo data (accounts, bookings, reviews, conversations, etc.)
// Only targets accounts with @eventnest-demo.com emails — your real data is safe.

const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env' })

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DEMO_SUFFIX = '@eventnest-demo.com'

async function main() {
  console.log('🧹 Cleaning demo data...\n')

  // Find all demo users
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_SUFFIX } },
    include: { vendorProfile: true, customerProfile: true },
  })

  if (demoUsers.length === 0) {
    console.log('No demo data found — nothing to clean.')
    return
  }

  console.log(`Found ${demoUsers.length} demo accounts:`)
  for (const u of demoUsers) {
    console.log(`  ${u.role.padEnd(10)} ${u.email}`)
  }

  const vendorProfileIds = demoUsers.filter(u => u.vendorProfile).map(u => u.vendorProfile.id)
  const customerProfileIds = demoUsers.filter(u => u.customerProfile).map(u => u.customerProfile.id)
  const userIds = demoUsers.map(u => u.id)

  console.log('\nDeleting related data (in order)...')

  // Messages → find conversations first
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { vendorId: { in: vendorProfileIds } },
        { customerId: { in: customerProfileIds } },
      ],
    },
    select: { id: true },
  })
  const conversationIds = conversations.map(c => c.id)

  await prisma.message.deleteMany({ where: { conversationId: { in: conversationIds } } })
  console.log('  ✓ Messages')

  // Review replies → find reviews first
  const reviews = await prisma.review.findMany({
    where: {
      OR: [
        { vendorId: { in: vendorProfileIds } },
        { customerId: { in: customerProfileIds } },
      ],
    },
    select: { id: true },
  })
  const reviewIds = reviews.map(r => r.id)

  await prisma.reviewReply.deleteMany({ where: { reviewId: { in: reviewIds } } })
  console.log('  ✓ Review replies')

  await prisma.review.deleteMany({ where: { id: { in: reviewIds } } })
  console.log('  ✓ Reviews')

  await prisma.conversation.deleteMany({ where: { id: { in: conversationIds } } })
  console.log('  ✓ Conversations')

  await prisma.booking.deleteMany({
    where: {
      OR: [
        { vendorId: { in: vendorProfileIds } },
        { customerId: { in: customerProfileIds } },
      ],
    },
  })
  console.log('  ✓ Bookings')

  await prisma.wishlist.deleteMany({
    where: {
      OR: [
        { vendorId: { in: vendorProfileIds } },
        { customerId: { in: customerProfileIds } },
      ],
    },
  })
  console.log('  ✓ Wishlists')

  await prisma.profileView.deleteMany({ where: { vendorId: { in: vendorProfileIds } } })
  console.log('  ✓ Profile views')

  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } })
  console.log('  ✓ Notifications')

  // Vendor sub-models (portfolio, packages, awards, documents)
  await prisma.portfolioImage.deleteMany({ where: { vendorId: { in: vendorProfileIds } } })
  await prisma.package.deleteMany({ where: { vendorId: { in: vendorProfileIds } } })
  await prisma.award.deleteMany({ where: { vendorId: { in: vendorProfileIds } } })
  await prisma.document.deleteMany({ where: { vendorId: { in: vendorProfileIds } } })
  console.log('  ✓ Vendor profile data (packages, portfolio, awards)')

  // Profiles
  await prisma.vendorProfile.deleteMany({ where: { id: { in: vendorProfileIds } } })
  await prisma.customerProfile.deleteMany({ where: { id: { in: customerProfileIds } } })
  console.log('  ✓ Vendor & customer profiles')

  // Users
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
  console.log(`  ✓ ${userIds.length} user records`)

  // Supabase Auth
  console.log('\nDeleting from Supabase Auth...')
  let authDeleted = 0
  for (const u of demoUsers) {
    const { error } = await supabase.auth.admin.deleteUser(u.id)
    if (error) {
      console.warn(`  ⚠ Could not delete auth user ${u.email}: ${error.message}`)
    } else {
      authDeleted++
    }
  }
  console.log(`  ✓ ${authDeleted} auth accounts`)

  console.log('\n✅ Done — all demo data removed. Your real data is untouched.')
}

main()
  .catch(err => {
    console.error('\n❌ Clean failed:', err.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
