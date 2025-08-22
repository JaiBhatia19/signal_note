import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and authenticate
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill in test credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // First try to sign in (user might already exist)
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // If we're still on login page, the user doesn't exist, so create account
    if (page.url().includes('/login')) {
      // Switch to sign up
      await page.click('text=Don\'t have an account? Sign up');
      await page.waitForTimeout(1000);
      
      // Fill credentials again and create account
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Now sign in
      await page.click('text=Already have an account? Sign in');
      await page.waitForTimeout(1000);
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
  });

  test('should display search interface', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    // Check search elements
    await expect(page.getByRole('heading', { name: /Search Feedback/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search your feedback/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();
  });

  test('should show filters section', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    // Check filters toggle
    await expect(page.getByText(/Show Filters/i)).toBeVisible();
    
    // Click to expand filters
    await page.getByText(/Show Filters/i).click();
    
    // Check filter options
    await expect(page.getByLabel(/Source/i)).toBeVisible();
    await expect(page.getByLabel(/User Segment/i)).toBeVisible();
    await expect(page.getByLabel(/Product Area/i)).toBeVisible();
    // Look for date inputs instead of "Date Range" label
    await expect(page.getByLabel(/From Date/i)).toBeVisible();
  });

  test('should perform search', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    // Enter search query
    await page.getByPlaceholder(/Search your feedback/i).fill('dashboard');
    
    // Click search
    await page.getByRole('button', { name: /Search/i }).click();
    
    // Wait for search to complete
    await page.waitForTimeout(2000);
    
    // Should show search results or no results message
    await expect(page.locator('.search-results, .no-results')).toBeVisible();
  });

  test('should show search tips', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    // Check search tips are displayed
    await expect(page.getByText(/Search Tips/i)).toBeVisible();
    await expect(page.getByText(/Try searching for specific features/i)).toBeVisible();
  });

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    // Search for something that won't exist
    await page.getByPlaceholder(/Search your feedback/i).fill('xyz123nonexistent');
    await page.getByRole('button', { name: /Search/i }).click();
    
    // Wait for search to complete
    await page.waitForTimeout(2000);
    
    // Should show no results message
    await expect(page.getByText(/No feedback found/i)).toBeVisible();
  });
}); 