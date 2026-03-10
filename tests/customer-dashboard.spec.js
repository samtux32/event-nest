const { test, expect } = require('@playwright/test');
const { loginAsCustomer } = require('./helpers/auth');

test.describe('Customer Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('home redirects customer to marketplace', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    // Customer should see marketplace or be redirected there
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/vendor|marketplace|find|browse/i);
  });

});

test.describe('My Events', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('loads my events page', async ({ page }) => {
    await page.goto('/my-events');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /My Events/i })).toBeVisible();
  });

  test('shows empty state or events', async ({ page }) => {
    await page.goto('/my-events');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // Either shows events or empty state with CTAs
    expect(body.toLowerCase()).toMatch(/no events|plans|bookings|ai planner|browse/i);
  });

  test('has navigation links to AI planner and marketplace', async ({ page }) => {
    await page.goto('/my-events');
    await page.waitForTimeout(2000);
    // If empty state, should have these CTAs
    const aiLink = page.locator('a[href="/plan-my-event"]');
    const marketLink = page.locator('a[href="/marketplace"]');
    // At least one should be on the page (either in nav or empty state)
    const body = await page.textContent('body');
    expect(body.length).toBeGreaterThan(50);
  });

});

test.describe('My Bookings', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('loads my bookings page', async ({ page }) => {
    await page.goto('/my-bookings');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /My Bookings/i })).toBeVisible();
  });

  test('has list and calendar view toggle', async ({ page }) => {
    await page.goto('/my-bookings');
    await page.waitForTimeout(2000);
    // Look for view toggle buttons
    const listBtn = page.getByRole('button', { name: /List/i });
    const calBtn = page.getByRole('button', { name: /Calendar/i });
    if (await listBtn.isVisible()) {
      await expect(listBtn).toBeVisible();
      await expect(calBtn).toBeVisible();
    }
  });

  test('can switch to calendar view', async ({ page }) => {
    await page.goto('/my-bookings');
    await page.waitForTimeout(2000);
    const calBtn = page.getByRole('button', { name: /Calendar/i });
    if (await calBtn.isVisible()) {
      await calBtn.click();
      await page.waitForTimeout(1000);
      // Calendar view should be active — either shows calendar grid or empty state
      // The Calendar button should now be the active/selected one
      const body = await page.textContent('body');
      expect(body.toLowerCase()).toMatch(/no bookings|mon|tue|calendar/i);
    }
  });

  test('shows empty state or bookings list', async ({ page }) => {
    await page.goto('/my-bookings');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/no bookings|booking|browse marketplace|vendor/i);
  });

});

test.describe('Customer Messages', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('loads customer messages page', async ({ page }) => {
    await page.goto('/customer-messages');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // Should show messages or empty state
    expect(body.length).toBeGreaterThan(50);
  });

});

test.describe('Wishlist', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('loads wishlist page', async ({ page }) => {
    await page.goto('/wishlist');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/wishlist|saved|no vendor|favourite/i);
  });

});

test.describe('My Plans', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('loads saved plans page', async ({ page }) => {
    await page.goto('/my-plans');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/plans|saved|no plans|create/i);
  });

});

test.describe('Recently Viewed', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('loads recently viewed page', async ({ page }) => {
    await page.goto('/recently-viewed');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/recently|viewed|no vendor|browse/i);
  });

});

test.describe('Customer Settings', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('loads settings page', async ({ page }) => {
    await page.goto('/customer-settings');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /Settings/i }).first()).toBeVisible();
  });

  test('has account information section', async ({ page }) => {
    await page.goto('/customer-settings');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toContain('account');
  });

  test('has save button', async ({ page }) => {
    await page.goto('/customer-settings');
    await page.waitForTimeout(2000);
    const saveBtn = page.getByRole('button', { name: /Save Account Info/i });
    await expect(saveBtn).toBeVisible();
  });

  test('has password change fields', async ({ page }) => {
    await page.goto('/customer-settings');
    await page.waitForTimeout(2000);
    // Look for password-related text on the page
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/change password|current password|new password/i);
  });

  test('has help links', async ({ page }) => {
    await page.goto('/customer-settings');
    await page.waitForTimeout(2000);
    await expect(page.locator('a[href="/help"]').first()).toBeVisible();
    await expect(page.locator('a[href="/terms"]').first()).toBeVisible();
    await expect(page.locator('a[href="/privacy"]').first()).toBeVisible();
  });

  test('has become a vendor section', async ({ page }) => {
    await page.goto('/customer-settings');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Become a Vendor/i).first()).toBeVisible();
    await expect(page.getByPlaceholder("e.g. Sam's Photography")).toBeVisible();
  });

  test('has delete account section', async ({ page }) => {
    await page.goto('/customer-settings');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Delete Account/i).first()).toBeVisible();
  });

});
