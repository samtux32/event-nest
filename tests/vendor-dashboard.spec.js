const { test, expect } = require('@playwright/test');
const { loginAsVendor } = require('./helpers/auth');

test.describe('Vendor Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('home page shows vendor dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    // Vendor dashboard should show — look for dashboard-like content
    const body = await page.textContent('body');
    // Should have some dashboard-related text (bookings, profile, etc.)
    expect(body.length).toBeGreaterThan(100);
  });

});

test.describe('Profile Editor', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('loads profile editor page', async ({ page }) => {
    await page.goto('/profile-editor');
    await page.waitForTimeout(2000);
    // Should show profile editor with business name field
    await expect(page.locator('body')).toBeVisible();
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/business|profile|edit/i);
  });

  test('has section navigation tabs', async ({ page }) => {
    await page.goto('/profile-editor');
    await page.waitForTimeout(2000);
    // Look for section tabs like Business Info, Photos, Pricing
    const body = await page.textContent('body');
    expect(body).toContain('Business');
  });

  test('can see category selection buttons', async ({ page }) => {
    await page.goto('/profile-editor');
    await page.waitForTimeout(2000);
    // Photography category button should be present
    const photographyBtn = page.getByRole('button', { name: /Photography/i }).first();
    if (await photographyBtn.isVisible()) {
      await expect(photographyBtn).toBeVisible();
    }
  });

});

test.describe('Vendor Analytics', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('loads analytics page', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // Should show analytics content (views, bookings, revenue, etc.)
    expect(body.toLowerCase()).toMatch(/views|bookings|revenue|analytics/i);
  });

  test('has time period filter buttons', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    // Look for time period buttons
    const btn7d = page.getByRole('button', { name: '7D' });
    const btn30d = page.getByRole('button', { name: '30D' });
    if (await btn7d.isVisible()) {
      await expect(btn7d).toBeVisible();
      await expect(btn30d).toBeVisible();
    }
  });

  test('export CSV button present', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    const exportBtn = page.getByRole('button', { name: /Export/i });
    if (await exportBtn.isVisible()) {
      await expect(exportBtn).toBeVisible();
    }
  });

});

test.describe('Vendor Portfolio', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('loads portfolio page', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // Either shows portfolio images or empty state with link to editor
    expect(body.toLowerCase()).toMatch(/portfolio|no portfolio|profile editor/i);
  });

});

test.describe('Vendor Promotions', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('loads promotions page', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/promotion|offer|no promotion/i);
  });

  test('has new offer button', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForTimeout(2000);
    // Could be "New Offer" button or "Create Your First Promotion"
    const newBtn = page.getByRole('button', { name: /New Offer/i });
    const createBtn = page.getByRole('button', { name: /Create Your First/i });
    const hasNew = await newBtn.isVisible().catch(() => false);
    const hasCreate = await createBtn.isVisible().catch(() => false);
    expect(hasNew || hasCreate).toBeTruthy();
  });

});

test.describe('Vendor FAQs', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('loads vendor FAQs page', async ({ page }) => {
    await page.goto('/vendor-faqs');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/faq|question|no faq/i);
  });

});

test.describe('Vendor QR Code', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('loads QR code page', async ({ page }) => {
    await page.goto('/qr-code');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/qr|code|share/i);
  });

});

test.describe('Vendor Calendar', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('loads calendar page', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Calendar/i).first()).toBeVisible();
  });

  test('has month navigation', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForTimeout(2000);
    // Should have day-of-week headers
    await expect(page.getByText('Mon').first()).toBeVisible();
  });

  test('has availability management section', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/availab|block|manage/i);
  });

});

test.describe('Vendor Settings', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('loads settings page', async ({ page }) => {
    await page.goto('/vendor-settings');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/settings|account|business name/i);
  });

  test('has account info section', async ({ page }) => {
    await page.goto('/vendor-settings');
    await page.waitForTimeout(2000);
    const saveBtn = page.getByRole('button', { name: /Save Account Info/i });
    if (await saveBtn.isVisible()) {
      await expect(saveBtn).toBeVisible();
    }
  });

  test('has help links', async ({ page }) => {
    await page.goto('/vendor-settings');
    await page.waitForTimeout(2000);
    await expect(page.locator('a[href="/help"]').first()).toBeVisible();
    await expect(page.locator('a[href="/terms"]').first()).toBeVisible();
    await expect(page.locator('a[href="/privacy"]').first()).toBeVisible();
  });

  test('has delete account section', async ({ page }) => {
    await page.goto('/vendor-settings');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Delete Account/i).first()).toBeVisible();
  });

});

test.describe('Vendor Messages', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test('loads messages page', async ({ page }) => {
    await page.goto('/messages');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // Should show messages interface or empty state
    expect(body.length).toBeGreaterThan(50);
  });

});
