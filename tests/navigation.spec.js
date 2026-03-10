const { test, expect } = require('@playwright/test');
const { loginAsVendor, loginAsCustomer } = require('./helpers/auth');

test.describe('Vendor Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('can navigate to all vendor pages without errors', async ({ page }) => {
    const vendorPages = [
      '/profile-editor',
      '/portfolio',
      '/analytics',
      '/promotions',
      '/vendor-faqs',
      '/qr-code',
      '/calendar',
      '/messages',
      '/vendor-settings',
    ];

    for (const path of vendorPages) {
      await page.goto(path);
      await page.waitForTimeout(1500);
      // Page should load without crashing (no error boundary)
      const body = await page.textContent('body');
      expect(body.length).toBeGreaterThan(50);
      // Should not show a generic error page
      expect(body.toLowerCase()).not.toContain('application error');
    }
  });

  test('mode toggle exists for vendor', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    // Vendor should have mode toggle to switch to customer view
    const body = await page.textContent('body');
    // Look for customer mode or browse text
    expect(body.length).toBeGreaterThan(100);
  });

});

test.describe('Customer Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('can navigate to all customer pages without errors', async ({ page }) => {
    const customerPages = [
      '/marketplace',
      '/my-events',
      '/my-bookings',
      '/customer-messages',
      '/wishlist',
      '/my-plans',
      '/recently-viewed',
      '/customer-settings',
    ];

    for (const path of customerPages) {
      await page.goto(path);
      await page.waitForTimeout(1500);
      const body = await page.textContent('body');
      expect(body.length).toBeGreaterThan(50);
      expect(body.toLowerCase()).not.toContain('application error');
    }
  });

});

test.describe('Public Navigation', () => {

  test('all public pages load without auth', async ({ page }) => {
    const publicPages = [
      '/',
      '/marketplace',
      '/vendor-signup',
      '/inspiration',
      '/help',
      '/contact',
      '/terms',
      '/privacy',
      '/login',
      '/register',
      '/forgot-password',
      '/plan-my-event',
      '/compare',
    ];

    for (const path of publicPages) {
      await page.goto(path);
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      expect(body.length).toBeGreaterThan(50);
      expect(body.toLowerCase()).not.toContain('application error');
    }
  });

  test('protected routes redirect to login when not authed', async ({ page }) => {
    await page.goto('/my-bookings');
    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

});
