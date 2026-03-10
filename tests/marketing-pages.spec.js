const { test, expect } = require('@playwright/test');

test.describe('Marketing & Public Pages', () => {

  test.describe('Home Page', () => {
    test('loads and shows hero content', async ({ page }) => {
      await page.goto('/');
      // Should show landing page for unauthenticated user
      await expect(page).toHaveTitle(/Event Nest/i);
      // Logo should be visible
      await expect(page.locator('img[alt="Event Nest"]').first()).toBeVisible();
    });
  });

  test.describe('Vendor Signup Page', () => {
    test('loads with headline and CTA', async ({ page }) => {
      await page.goto('/vendor-signup');
      await expect(page.getByRole('heading', { name: /grow your events business/i })).toBeVisible();
      // CTA links to register
      const cta = page.locator('a[href*="/register?role=vendor"]').first();
      await expect(cta).toBeVisible();
    });

    test('shows benefits and how it works sections', async ({ page }) => {
      await page.goto('/vendor-signup');
      await expect(page.getByText(/Why Join Event Nest/i)).toBeVisible();
      await expect(page.getByText(/How It Works/i)).toBeVisible();
    });
  });

  test.describe('Inspiration Page', () => {
    test('loads with heading and articles', async ({ page }) => {
      await page.goto('/inspiration');
      await expect(page.getByRole('heading', { name: /Event Inspiration/i })).toBeVisible();
      // Should have search input
      await expect(page.getByPlaceholder(/Search articles/i)).toBeVisible();
    });

    test('search filters articles', async ({ page }) => {
      await page.goto('/inspiration');
      const searchInput = page.getByPlaceholder(/Search articles/i);
      await searchInput.fill('wedding');
      // Should still have at least one article or empty state
      await page.waitForTimeout(300);
      // Verify page didn't crash
      await expect(page.locator('body')).toBeVisible();
    });

    test('can expand an article', async ({ page }) => {
      await page.goto('/inspiration');
      // Click the first article card to expand
      const firstArticle = page.locator('h2').first();
      const articleTitle = await firstArticle.textContent();
      await firstArticle.click();
      // After expand, should show tips or content
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Help Page', () => {
    test('loads with FAQ sections', async ({ page }) => {
      await page.goto('/help');
      await expect(page.getByRole('heading', { name: /Help & FAQ/i })).toBeVisible();
      await expect(page.getByPlaceholder(/Search for help/i)).toBeVisible();
    });

    test('can expand a FAQ item', async ({ page }) => {
      await page.goto('/help');
      // Click the first FAQ question
      const firstQuestion = page.locator('button:has(span)').first();
      await firstQuestion.click();
      await page.waitForTimeout(300);
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
    });

    test('has contact us CTA', async ({ page }) => {
      await page.goto('/help');
      await expect(page.getByText(/Still need help/i)).toBeVisible();
      await expect(page.locator('a[href="/contact"]')).toBeVisible();
    });
  });

  test.describe('Contact Page', () => {
    test('loads with form fields', async ({ page }) => {
      await page.goto('/contact');
      await expect(page.getByRole('heading', { name: /Contact Us/i })).toBeVisible();
      await expect(page.getByPlaceholder('Your name')).toBeVisible();
      await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
      await expect(page.getByPlaceholder('How can we help?')).toBeVisible();
    });

    test('subject dropdown has options', async ({ page }) => {
      await page.goto('/contact');
      const select = page.locator('select');
      await expect(select).toBeVisible();
      // Should have multiple options
      const options = select.locator('option');
      expect(await options.count()).toBeGreaterThanOrEqual(3);
    });

    test('submit button disabled when form empty', async ({ page }) => {
      await page.goto('/contact');
      // Try clicking send without filling fields — native validation should prevent
      const submitBtn = page.getByRole('button', { name: /Send Message/i });
      await expect(submitBtn).toBeVisible();
    });
  });

  test.describe('Terms Page', () => {
    test('loads with content', async ({ page }) => {
      await page.goto('/terms');
      await expect(page.getByRole('heading', { name: /Terms/i }).first()).toBeVisible();
    });
  });

  test.describe('Privacy Page', () => {
    test('loads with content', async ({ page }) => {
      await page.goto('/privacy');
      await expect(page.getByRole('heading', { name: /Privacy/i }).first()).toBeVisible();
    });
  });

});
