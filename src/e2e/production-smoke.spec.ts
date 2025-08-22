import { test, expect } from '@playwright/test';

// This test runs against the production URL to ensure critical functionality works
test.describe('Production Smoke Tests', () => {
  test('should load landing page and display main content', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Turn Customer Feedback Into/i })).toBeVisible();
    
    // Check CTA buttons
    await expect(page.getByRole('link', { name: /Get Started Free/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /View Pricing/i })).toBeVisible();
    
    // Check waitlist section
    await expect(page.getByRole('heading', { name: /Join the Waitlist/i })).toBeVisible();
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/pricing');
    
    // Should be on pricing page
    await expect(page).toHaveURL('/pricing');
    await expect(page.getByRole('heading', { name: /Simple, Transparent Pricing/i })).toBeVisible();
    
    // Check pricing tiers
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
  });

  test('should navigate to waitlist page', async ({ page }) => {
    await page.goto('/waitlist');
    
    // Should be on waitlist page
    await expect(page).toHaveURL('/waitlist');
    await expect(page.getByRole('heading', { name: /Join the Waitlist/i })).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to pricing
    await page.getByRole('link', { name: /View Pricing/i }).click();
    await expect(page).toHaveURL('/pricing');
    
    // Test navigation back to home
    await page.getByRole('link', { name: /SignalNote/i }).click();
    await expect(page).toHaveURL('/');
  });
}); 