import { test, expect } from '@playwright/test';

test.describe('Waitlist', () => {
  test('should display waitlist form', async ({ page }) => {
    await page.goto('/waitlist');
    
    // Check form elements
    await expect(page.getByRole('heading', { name: /Join the Waitlist/i })).toBeVisible();
    await expect(page.getByLabel(/Email address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Join Waitlist/i })).toBeVisible();
  });

  test('should handle referral code from URL', async ({ page }) => {
    // Navigate with referral code
    await page.goto('/waitlist?ref=TEST123');
    
    // Check that referral code is pre-filled or displayed
    await expect(page.getByText(/Referral Code: TEST123/i)).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/waitlist');
    
    // Submit empty form
    await page.getByRole('button', { name: /Join Waitlist/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible();
  });

  test('should show success message after submission', async ({ page }) => {
    await page.goto('/waitlist');
    
    // Fill and submit form
    await page.getByLabel(/Email address/i).fill('test@example.com');
    await page.getByRole('button', { name: /Join Waitlist/i }).click();
    
    // Should show success message
    await expect(page.getByText(/You're on the list!/i)).toBeVisible();
  });
}); 