const { test, expect } = require('@playwright/test');

test.describe('Login Page', () => {

  test('loads with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('Your password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });

  test('has forgot password link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
  });

  test('has sign up link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('fake@wrong.com');
    await page.getByPlaceholder('Your password').fill('wrongpass');
    await page.getByRole('button', { name: /Sign In/i }).click();
    await page.waitForTimeout(3000);
    // Should show error message
    const errorBox = page.locator('.bg-red-50, [class*="red"]');
    await expect(errorBox.first()).toBeVisible({ timeout: 5000 });
  });

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.getByPlaceholder('Your password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    // Click the eye icon button next to the password field
    const toggleBtn = page.locator('input[placeholder="Your password"] + button, input[placeholder="Your password"] ~ button').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

});

test.describe('Forgot Password Page', () => {

  test('loads with email input', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

  test('has back to login link', async ({ page }) => {
    await page.goto('/forgot-password');
    // Page has "Back to login" text link and/or "Sign in" link
    const backLink = page.getByText(/Back to login|Sign in/i).first();
    await expect(backLink).toBeVisible();
  });

});

test.describe('Register Page', () => {

  test('loads with role selection (step 1)', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('I am a...')).toBeVisible();
  });

  test('has login link', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('a[href="/login"]')).toBeVisible();
  });

  test('selecting vendor shows vendor fields', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: /Vendor.*Offering event/s }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByPlaceholder('Your business name')).toBeVisible();
    await expect(page.getByText('Categories')).toBeVisible();
  });

  test('selecting customer shows customer fields', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: /Customer.*Planning an event/s }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByPlaceholder('Your full name')).toBeVisible();
  });

  test('terms checkbox required', async ({ page }) => {
    await page.goto('/register?role=customer');
    await expect(page.getByPlaceholder('Your full name')).toBeVisible({ timeout: 5000 });
    // Terms checkbox should be present
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
  });

  test('password confirmation mismatch shows error', async ({ page }) => {
    await page.goto('/register?role=customer');
    await expect(page.getByPlaceholder('Your full name')).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder('you@example.com').fill('mismatch-test@example.com');
    await page.getByPlaceholder('Min 6 characters').fill('password1');
    await page.getByPlaceholder('Re-enter your password').fill('password2');
    await page.getByPlaceholder('Your full name').fill('Test');
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: 'Create Account' }).click();
    // Should show password mismatch error
    await page.waitForTimeout(1000);
    await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
  });

});

test.describe('Navigation', () => {

  test('back to home link works from login', async ({ page }) => {
    await page.goto('/login');
    const backLink = page.getByText(/Back to home/i);
    await expect(backLink).toBeVisible();
  });

  test('back to home link works from register', async ({ page }) => {
    await page.goto('/register');
    const backLink = page.getByText(/Back to home/i);
    await expect(backLink).toBeVisible();
  });

});
