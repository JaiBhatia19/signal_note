import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in real tests this would use actual auth
    await page.goto('/login');
    // This would be a real auth flow in production
  });

  test('should display search interface', async ({ page }) => {
    await page.goto('/search');
    
    // Check search elements
    await expect(page.getByRole('heading', { name: /Search Feedback/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search your feedback/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();
  });

  test('should show filters section', async ({ page }) => {
    await page.goto('/search');
    
    // Check filters toggle
    await expect(page.getByText(/Show Filters/i)).toBeVisible();
    
    // Click to expand filters
    await page.getByText(/Show Filters/i).click();
    
    // Check filter options
    await expect(page.getByLabel(/Source/i)).toBeVisible();
    await expect(page.getByLabel(/User Segment/i)).toBeVisible();
    await expect(page.getByLabel(/Product Area/i)).toBeVisible();
    await expect(page.getByLabel(/Date Range/i)).toBeVisible();
  });

  test('should perform search', async ({ page }) => {
    await page.goto('/search');
    
    // Enter search query
    await page.getByPlaceholder(/Search your feedback/i).fill('dashboard');
    
    // Click search
    await page.getByRole('button', { name: /Search/i }).click();
    
    // Should show search results or no results message
    await expect(page.locator('.search-results, .no-results')).toBeVisible();
  });

  test('should show search tips', async ({ page }) => {
    await page.goto('/search');
    
    // Check search tips are displayed
    await expect(page.getByText(/Search Tips/i)).toBeVisible();
    await expect(page.getByText(/Try searching for specific features/i)).toBeVisible();
  });

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/search');
    
    // Search for something that won't exist
    await page.getByPlaceholder(/Search your feedback/i).fill('xyz123nonexistent');
    await page.getByRole('button', { name: /Search/i }).click();
    
    // Should show no results message
    await expect(page.getByText(/No feedback found/i)).toBeVisible();
  });
}); 