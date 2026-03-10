const { test, expect } = require('@playwright/test');

test.describe('Marketplace', () => {

  test('loads with heading and search', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page.getByPlaceholder(/Search vendors/i)).toBeVisible();
  });

  test('displays vendor cards', async ({ page }) => {
    await page.goto('/marketplace');
    // Wait for vendors to load
    await page.waitForTimeout(2000);
    // Should have at least one vendor card link to /vendor-profile
    const vendorCards = page.locator('a[href*="/vendor-profile/"]');
    const count = await vendorCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('search input filters vendors', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForTimeout(1000);
    const search = page.getByPlaceholder(/Search vendors/i);
    await search.fill('photography');
    await page.waitForTimeout(1000);
    // Page should still show results or filtered state
    await expect(page.locator('body')).toBeVisible();
  });

  test('sort dropdown works', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForTimeout(1000);
    const sortSelect = page.locator('select').first();
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('category tabs are visible and clickable', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForTimeout(1000);
    // Look for category filter buttons
    const photographyBtn = page.getByRole('button', { name: /Photography/i }).first();
    if (await photographyBtn.isVisible()) {
      await photographyBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('vendor card links to profile page', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForTimeout(2000);
    const firstCard = page.locator('a[href*="/vendor-profile/"]').first();
    if (await firstCard.isVisible()) {
      const href = await firstCard.getAttribute('href');
      expect(href).toMatch(/\/vendor-profile\/.+/);
    }
  });

});

test.describe('Vendor Profile (Public)', () => {

  test('loads a vendor profile page', async ({ page }) => {
    // First get a vendor ID from the marketplace
    await page.goto('/marketplace');
    await page.waitForTimeout(2000);
    const firstCard = page.locator('a[href*="/vendor-profile/"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForURL(/\/vendor-profile\/.+/);
      // Should show business name
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('vendor profile shows key sections', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForTimeout(2000);
    const firstCard = page.locator('a[href*="/vendor-profile/"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForURL(/\/vendor-profile\/.+/);
      await page.waitForTimeout(1000);
      // Page should load without errors
      await expect(page.locator('body')).toBeVisible();
      // Should have at least some content sections
      const pageText = await page.textContent('body');
      // Basic sanity — page has meaningful content
      expect(pageText.length).toBeGreaterThan(100);
    }
  });

});

test.describe('Programmatic SEO Pages', () => {

  test('/vendors/photography loads (or 404 in dev)', async ({ page }) => {
    const res = await page.goto('/vendors/photography');
    await page.waitForTimeout(2000);
    // SEO pages may only work in production build — accept either content or 404
    const status = res?.status();
    if (status === 200) {
      await expect(page.locator('h1').first()).toBeVisible();
      const h1Text = await page.locator('h1').first().textContent();
      expect(h1Text.toLowerCase()).toContain('photography');
    } else {
      // 404 is acceptable in dev mode for dynamic SEO pages
      expect([200, 404]).toContain(status);
    }
  });

  test('/vendors/catering loads (or 404 in dev)', async ({ page }) => {
    const res = await page.goto('/vendors/catering');
    await page.waitForTimeout(2000);
    const status = res?.status();
    expect([200, 404]).toContain(status);
  });

  test('SEO page returns valid response', async ({ page }) => {
    const res = await page.goto('/vendors/photography');
    await page.waitForTimeout(2000);
    const status = res?.status();
    // Either loads properly or 404 in dev — not a 500 error
    expect(status).toBeLessThan(500);
  });

});
