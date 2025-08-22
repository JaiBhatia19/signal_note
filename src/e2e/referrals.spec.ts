import { test, expect } from '@playwright/test';

test.describe('Referrals', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in real tests this would use actual auth
    await page.goto('/login');
    // This would be a real auth flow in production
  });

  test('should display referrals page', async ({ page }) => {
    await page.goto('/referrals');
    
    // Check main elements
    await expect(page.getByRole('heading', { name: /Your Referrals/i })).toBeVisible();
    await expect(page.getByText(/Invite teammates and grow together/i)).toBeVisible();
  });

  test('should display referral stats', async ({ page }) => {
    await page.goto('/referrals');
    
    // Check stats section
    await expect(page.getByText(/Total Referrals/i)).toBeVisible();
    await expect(page.getByText(/Successful Referrals/i)).toBeVisible();
    await expect(page.getByText(/Conversion Rate/i)).toBeVisible();
  });

  test('should display referral link', async ({ page }) => {
    await page.goto('/referrals');
    
    // Check referral link section
    await expect(page.getByText(/Your Referral Link/i)).toBeVisible();
    await expect(page.locator('input[readonly]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy Link/i })).toBeVisible();
  });

  test('should copy referral link', async ({ page }) => {
    await page.goto('/referrals');
    
    // Click copy button
    await page.getByRole('button', { name: /Copy Link/i }).click();
    
    // Should show copied message
    await expect(page.getByText(/Link copied!/i)).toBeVisible();
  });

  test('should share referral link', async ({ page }) => {
    await page.goto('/referrals');
    
    // Check share button exists
    await expect(page.getByRole('button', { name: /Share/i })).toBeVisible();
  });

  test('should display referral tips', async ({ page }) => {
    await page.goto('/referrals');
    
    // Check tips section
    await expect(page.getByText(/Referral Tips/i)).toBeVisible();
    await expect(page.getByText(/Share your link on social media/i)).toBeVisible();
  });

  test('should explain how referrals work', async ({ page }) => {
    await page.goto('/referrals');
    
    // Check explanation section
    await expect(page.getByText(/How Referrals Work/i)).toBeVisible();
    await expect(page.getByText(/When someone signs up using your link/i)).toBeVisible();
  });

  test('should show empty state for new users', async ({ page }) => {
    await page.goto('/referrals');
    
    // If no referrals yet, should show empty state
    const emptyState = page.locator('.empty-referrals');
    if (await emptyState.isVisible()) {
      await expect(page.getByText(/No referrals yet/i)).toBeVisible();
      await expect(page.getByText(/Start sharing your link/i)).toBeVisible();
    }
  });
}); 