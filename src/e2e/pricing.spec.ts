import { test, expect } from '@playwright/test';

test.describe('Pricing', () => {
  test('should display pricing page', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check main elements
    await expect(page.getByRole('heading', { name: /Simple, Transparent Pricing/i })).toBeVisible();
    await expect(page.getByText(/Choose the plan that fits your needs/i)).toBeVisible();
  });

  test('should display free plan', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check free plan section
    await expect(page.getByRole('heading', { name: /Free/i })).toBeVisible();
    await expect(page.getByText(/\$0\/month/i)).toBeVisible();
    
    // Check free plan features
    await expect(page.getByText(/Up to 100 feedback items/i)).toBeVisible();
    await expect(page.getByText(/Basic AI analysis/i)).toBeVisible();
    await expect(page.getByText(/5 clusters/i)).toBeVisible();
    await expect(page.getByText(/Email support/i)).toBeVisible();
  });

  test('should display pro plan', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check pro plan section
    await expect(page.getByRole('heading', { name: /Pro/i })).toBeVisible();
    await expect(page.getByText(/\$100\/month/i)).toBeVisible();
    
    // Check pro plan features
    await expect(page.getByText(/Unlimited feedback/i)).toBeVisible();
    await expect(page.getByText(/Advanced AI insights/i)).toBeVisible();
    await expect(page.getByText(/Unlimited clusters/i)).toBeVisible();
    await expect(page.getByText(/Priority support/i)).toBeVisible();
    await expect(page.getByText(/Custom integrations/i)).toBeVisible();
  });

  test('should display CTA buttons', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check CTA buttons
    await expect(page.getByRole('button', { name: /Get Started Free/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start Pro Trial/i })).toBeVisible();
  });

  test('should navigate to signup from free plan', async ({ page }) => {
    await page.goto('/pricing');
    
    // Click free plan CTA
    await page.getByRole('button', { name: /Get Started Free/i }).click();
    
    // Should redirect to signup or login
    await expect(page).toHaveURL(/\/login|\/signup/);
  });

  test('should navigate to checkout from pro plan', async ({ page }) => {
    await page.goto('/pricing');
    
    // Click pro plan CTA
    await page.getByRole('button', { name: /Start Pro Trial/i }).click();
    
    // Should redirect to checkout or require auth
    await expect(page).toHaveURL(/\/checkout|\/login/);
  });

  test('should display FAQ section', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check FAQ section
    await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible();
    
    // Check common questions
    await expect(page.getByText(/Can I change plans later\?/i)).toBeVisible();
    await expect(page.getByText(/What happens after my trial\?/i)).toBeVisible();
    await expect(page.getByText(/Is there a setup fee\?/i)).toBeVisible();
  });

  test('should display feature comparison', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check feature comparison table or section
    await expect(page.locator('.feature-comparison, .pricing-table')).toBeVisible();
  });

  test('should show beta features note', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check for beta features note
    await expect(page.getByText(/Beta features available/i)).toBeVisible();
  });
}); 