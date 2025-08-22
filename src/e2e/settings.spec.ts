import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in real tests this would use actual auth
    await page.goto('/login');
    // This would be a real auth flow in production
  });

  test('should display settings page', async ({ page }) => {
    await page.goto('/settings');
    
    // Check main elements
    await expect(page.getByRole('heading', { name: /Account Settings/i })).toBeVisible();
    await expect(page.getByText(/Manage your account and preferences/i)).toBeVisible();
  });

  test('should display profile section', async ({ page }) => {
    await page.goto('/settings');
    
    // Check profile section
    await expect(page.getByRole('heading', { name: /Profile/i })).toBeVisible();
    await expect(page.getByLabel(/Display Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Update Profile/i })).toBeVisible();
  });

  test('should display referral code', async ({ page }) => {
    await page.goto('/settings');
    
    // Check referral code section
    await expect(page.getByText(/Referral Code/i)).toBeVisible();
    await expect(page.locator('input[readonly]')).toBeVisible();
  });

  test('should display subscription status', async ({ page }) => {
    await page.goto('/settings');
    
    // Check subscription section
    await expect(page.getByRole('heading', { name: /Subscription/i })).toBeVisible();
    await expect(page.getByText(/Current Plan/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Upgrade to Pro/i })).toBeVisible();
  });

  test('should handle profile update', async ({ page }) => {
    await page.goto('/settings');
    
    // Update display name
    await page.getByLabel(/Display Name/i).fill('New Name');
    
    // Submit update
    await page.getByRole('button', { name: /Update Profile/i }).click();
    
    // Should show success message
    await expect(page.getByText(/Profile updated successfully/i)).toBeVisible();
  });

  test('should navigate to upgrade flow', async ({ page }) => {
    await page.goto('/settings');
    
    // Click upgrade button
    await page.getByRole('button', { name: /Upgrade to Pro/i }).click();
    
    // Should redirect to pricing or checkout
    await expect(page).toHaveURL(/\/pricing|\/checkout/);
  });

  test('should display account actions', async ({ page }) => {
    await page.goto('/settings');
    
    // Check account actions section
    await expect(page.getByRole('heading', { name: /Account Actions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete Account/i })).toBeVisible();
  });

  test('should show navigation links', async ({ page }) => {
    await page.goto('/settings');
    
    // Check navigation links
    await expect(page.getByRole('link', { name: /View Referrals/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /View Pricing/i })).toBeVisible();
  });

  test('should handle email field as disabled', async ({ page }) => {
    await page.goto('/settings');
    
    // Email field should be disabled
    const emailField = page.getByLabel(/Email/i);
    await expect(emailField).toBeDisabled();
  });
}); 