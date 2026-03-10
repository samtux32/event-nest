#!/usr/bin/env node

/**
 * Creates test accounts for E2E testing
 * Usage: node scripts/create-test-accounts.js
 */

require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TEST_ACCOUNTS = [
  {
    email: 'test-vendor@local.test',
    password: 'TestVendor123!@#',
    role: 'vendor',
    name: 'Test Vendor Co',
  },
  {
    email: 'test-customer@local.test',
    password: 'TestCustomer123!@#',
    role: 'customer',
    name: 'Test Customer',
  },
];

async function createTestAccounts() {
  console.log('Creating test accounts...\n');

  for (const account of TEST_ACCOUNTS) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          role: account.role,
        },
      });

      if (error) throw error;

      console.log(`✓ Created ${account.role}: ${account.email}`);
      console.log(`  Password: ${account.password}\n`);
    } catch (err) {
      console.error(`✗ Failed to create ${account.email}:`, err.message);
    }
  }

  console.log('\n📝 Save these credentials to .env.test (gitignored):');
  console.log('---');
  TEST_ACCOUNTS.forEach((acc) => {
    console.log(`# ${acc.role.toUpperCase()}`);
    console.log(`TEST_${acc.role.toUpperCase()}_EMAIL="${acc.email}"`);
    console.log(`TEST_${acc.role.toUpperCase()}_PASSWORD="${acc.password}"`);
  });
  console.log('---');
}

createTestAccounts().catch(console.error);
