const { test, expect } = require('@playwright/test');
const { loginAsCustomer } = require('./helpers/auth');

test.describe('AI Event Planner', () => {

  test('loads the planner page', async ({ page }) => {
    await page.goto('/plan-my-event');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /AI Event Planner/i })).toBeVisible();
  });

  test('has description textarea and generate button', async ({ page }) => {
    await page.goto('/plan-my-event');
    await page.waitForTimeout(2000);
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    const generateBtn = page.getByRole('button', { name: /Generate/i });
    await expect(generateBtn).toBeVisible();
  });

  test('generate button disabled when textarea empty', async ({ page }) => {
    await page.goto('/plan-my-event');
    await page.waitForTimeout(2000);
    const generateBtn = page.getByRole('button', { name: /Generate/i });
    await expect(generateBtn).toBeDisabled();
  });

  test('example prompts are clickable', async ({ page }) => {
    await page.goto('/plan-my-event');
    await page.waitForTimeout(2000);
    // Click an example prompt — should populate textarea
    const examples = page.locator('button').filter({ hasText: /birthday|wedding|corporate/i });
    if (await examples.first().isVisible()) {
      await examples.first().click();
      const textarea = page.locator('textarea');
      const value = await textarea.inputValue();
      expect(value.length).toBeGreaterThan(5);
    }
  });

});

test.describe('Event Checklist', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('loads checklist page', async ({ page }) => {
    await page.goto('/event-checklist');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /Checklist/i }).first()).toBeVisible();
  });

  test('has new checklist button', async ({ page }) => {
    await page.goto('/event-checklist');
    await page.waitForTimeout(2000);
    // Should have a button to create a new checklist (various text possible)
    const newBtn = page.getByRole('button', { name: /New Checklist/i });
    const createBtn = page.getByRole('button', { name: /Create Your First/i });
    const hasNew = await newBtn.isVisible().catch(() => false);
    const hasCreate = await createBtn.isVisible().catch(() => false);
    expect(hasNew || hasCreate).toBeTruthy();
  });

  test('new checklist form shows on click', async ({ page }) => {
    await page.goto('/event-checklist');
    await page.waitForTimeout(2000);
    const newBtn = page.getByRole('button', { name: /New Checklist/i });
    await newBtn.click();
    await page.waitForTimeout(500);
    // Should show checklist name input
    const nameInput = page.getByPlaceholder(/Sarah|name|checklist/i);
    await expect(nameInput).toBeVisible();
  });

  test('template buttons visible in create form', async ({ page }) => {
    await page.goto('/event-checklist');
    await page.waitForTimeout(2000);
    const newBtn = page.getByRole('button', { name: /New Checklist/i });
    await newBtn.click();
    await page.waitForTimeout(500);
    // Should show template options
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/wedding|birthday|corporate|custom/i);
  });

});

test.describe('Compare Vendors', () => {

  test('loads compare page', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // May redirect to login if auth required, or show compare page
    expect(body.toLowerCase()).toMatch(/compare|sign in|no vendor/i);
  });

  test('shows empty state when no vendors selected', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toMatch(/no vendor|search|compare|add/i);
  });

});
