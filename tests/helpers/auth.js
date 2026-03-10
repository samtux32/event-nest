/**
 * Shared auth helpers for Playwright tests
 */

const VENDOR = {
  email: 'test-vendor@local.test',
  password: 'TestVendor123!@#',
};

const CUSTOMER = {
  email: 'test-customer@local.test',
  password: 'TestCustomer123!@#',
};

async function loginAs(page, account) {
  await page.goto('/login');
  await page.getByPlaceholder('you@example.com').fill(account.email);
  await page.getByPlaceholder('Your password').fill(account.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  // Wait for redirect away from login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

async function loginAsVendor(page) {
  await loginAs(page, VENDOR);
}

async function loginAsCustomer(page) {
  await loginAs(page, CUSTOMER);
}

module.exports = { VENDOR, CUSTOMER, loginAs, loginAsVendor, loginAsCustomer };
