#!/usr/bin/env node

/**
 * Creates Prisma DB records for the test accounts created by create-test-accounts.js
 * Requires dev server running on localhost:3000
 */

require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TEST_ACCOUNTS = [
  {
    email: 'test-vendor@local.test',
    role: 'vendor',
    businessName: 'Test Vendor Co',
    categories: ['Photography', 'Videography'],
  },
  {
    email: 'test-customer@local.test',
    role: 'customer',
    fullName: 'Test Customer',
  },
];

async function setupDbRecords() {
  for (const account of TEST_ACCOUNTS) {
    // Look up the Supabase Auth user to get UUID
    const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) { console.error(listErr.message); continue; }

    const authUser = users.find(u => u.email === account.email);
    if (!authUser) {
      console.error(`✗ No auth user found for ${account.email} — run create-test-accounts.js first`);
      continue;
    }

    // Call register API with userId/userEmail fallback
    const body = {
      role: account.role,
      fullName: account.fullName,
      businessName: account.businessName,
      categories: account.categories,
      userId: authUser.id,
      userEmail: account.email,
    };

    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`✓ DB records created for ${account.role}: ${account.email}`);
    } else if (res.status === 409) {
      console.log(`✓ ${account.role}: ${account.email} already exists in DB`);
    } else {
      console.error(`✗ ${account.email}: ${data.error}`);
    }
  }

  console.log('\nTest accounts ready!');
}

setupDbRecords().catch(console.error);
