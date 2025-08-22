import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display main content', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Turn Customer Feedback Into/i })).toBeVisible();
    
    // Check CTA buttons
    await expect(page.getByRole('link', { name: /Get Started Free/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /View Pricing/i })).toBeVisible();
    
    // Check waitlist section
    await expect(page.getByRole('heading', { name: /Join the Waitlist/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Join Waitlist/i })).toBeVisible();
  });

  test('should navigate to waitlist page', async ({ page }) => {
    await page.goto('/');
    
    // Click waitlist button
    await page.getByRole('link', { name: /Join Waitlist/i }).click();
    
    // Should be on waitlist page
    await expect(page).toHaveURL('/waitlist');
    await expect(page.getByRole('heading', { name: /Join the Waitlist/i })).toBeVisible();
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/');
    
    // Click pricing button
    await page.getByRole('link', { name: /View Pricing/i }).click();
    
    // Should be on pricing page
    await expect(page).toHaveURL('/pricing');
    await expect(page.getByRole('heading', { name: /Simple, Transparent Pricing/i })).toBeVisible();
  });
}); 