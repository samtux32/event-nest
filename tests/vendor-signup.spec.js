const { test, expect } = require('@playwright/test');

test.describe('Vendor Signup Flow', () => {

  test('vendor-signup page has CTA linking to /register?role=vendor', async ({ page }) => {
    await page.goto('/vendor-signup');
    const cta = page.locator('a[href*="/register?role=vendor"]').first();
    await expect(cta).toBeVisible();
  });

  test('/register?role=vendor auto-skips to vendor form (step 2)', async ({ page }) => {
    await page.goto('/register?role=vendor');

    // Wait for the useEffect to fire and skip to step 2
    await expect(page.getByPlaceholder('Your business name')).toBeVisible({ timeout: 5000 });

    // Should NOT see role selection
    await expect(page.getByText('I am a...')).not.toBeVisible();

    // Should see vendor fields
    await expect(page.getByText('Categories')).toBeVisible();
  });

  test('/register?role=vendor shows email + password fields', async ({ page }) => {
    await page.goto('/register?role=vendor');

    await expect(page.getByPlaceholder('you@example.com')).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder('Min 6 characters')).toBeVisible();
    await expect(page.getByPlaceholder('Re-enter your password')).toBeVisible();
  });

  test('vendor form requires at least one category selected', async ({ page }) => {
    await page.goto('/register?role=vendor');

    // Wait for step 2
    await expect(page.getByPlaceholder('Your business name')).toBeVisible({ timeout: 5000 });

    // Create Account button should be disabled with no categories
    const submitBtn = page.getByRole('button', { name: 'Create Account' });
    await expect(submitBtn).toBeDisabled();

    // Select a category
    await page.getByRole('button', { name: 'Photography' }).click();

    // Still disabled because terms not agreed
    await expect(submitBtn).toBeDisabled();

    // Agree to terms
    await page.locator('input[type="checkbox"]').check();

    // Now should be enabled
    await expect(submitBtn).toBeEnabled();
  });

  test('back button returns to role selection', async ({ page }) => {
    await page.goto('/register?role=vendor');

    // Wait for step 2
    await expect(page.getByPlaceholder('Your business name')).toBeVisible({ timeout: 5000 });

    await page.getByText('Back to role selection').click();

    // Should see role selection again
    await expect(page.getByText('I am a...')).toBeVisible();
  });

});

test.describe('Customer Registration (no regression)', () => {

  test('/register shows role selection by default', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByText('I am a...')).toBeVisible();
    // Use specific role buttons to avoid strict mode
    await expect(page.getByRole('button', { name: /Customer.*Planning an event/s })).toBeVisible();
    await expect(page.getByRole('button', { name: /Vendor.*Offering event/s })).toBeVisible();
  });

  test('/register?role=customer auto-skips to customer form', async ({ page }) => {
    await page.goto('/register?role=customer');

    // Wait for step 2
    await expect(page.getByPlaceholder('Your full name')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('I am a...')).not.toBeVisible();
  });

  test('selecting Customer then Continue shows customer fields', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('button', { name: /Customer.*Planning an event/s }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByPlaceholder('Your full name')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    // Should NOT show vendor fields
    await expect(page.getByPlaceholder('Your business name')).not.toBeVisible();
  });

});

test.describe('Vendor Login (test account)', () => {

  test('test vendor can log in', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('test-vendor@local.test');
    await page.getByPlaceholder('Your password').fill('TestVendor123!@#');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await page.waitForURL('/', { timeout: 15000 });
    await expect(page).toHaveURL('/');
  });

  test('test customer can log in', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('test-customer@local.test');
    await page.getByPlaceholder('Your password').fill('TestCustomer123!@#');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to marketplace for customers
    await page.waitForURL(/\/(marketplace)?/, { timeout: 15000 });
  });

});
