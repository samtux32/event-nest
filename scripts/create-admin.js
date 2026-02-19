// Run with: node scripts/create-admin.js
// Creates an admin user in both Supabase Auth and the Prisma DB.

const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env' })

const ADMIN_EMAIL = 'admin@eventnest.com'
const ADMIN_PASSWORD = 'AdminPass123!'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // needs service role to set user_metadata
)

const prisma = new PrismaClient()

async function main() {
  console.log('Creating admin user...')

  // 1. Create in Supabase Auth with admin role in metadata
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { role: 'admin' },
  })

  if (error) {
    console.error('Supabase error:', error.message)
    process.exit(1)
  }

  const supabaseUserId = data.user.id
  console.log('Supabase user created:', supabaseUserId)

  // 2. Create in Prisma DB
  await prisma.user.upsert({
    where: { id: supabaseUserId },
    update: { role: 'admin' },
    create: {
      id: supabaseUserId,
      email: ADMIN_EMAIL,
      role: 'admin',
    },
  })

  console.log('✓ Admin user created successfully')
  console.log(`  Email:    ${ADMIN_EMAIL}`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
  console.log('\nChange the password after first login!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
