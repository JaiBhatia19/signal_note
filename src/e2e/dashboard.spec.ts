import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in real tests this would use actual auth
    await page.goto('/login');
    // This would be a real auth flow in production
  });

  test('should display dashboard elements', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check main dashboard elements
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
    
    // Check KPI cards
    await expect(page.getByText(/Total Feedback/i)).toBeVisible();
    await expect(page.getByText(/Average Sentiment/i)).toBeVisible();
    await expect(page.getByText(/Average Urgency/i)).toBeVisible();
    await expect(page.getByText(/Total Clusters/i)).toBeVisible();
  });

  test('should display top clusters section', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check clusters section
    await expect(page.getByRole('heading', { name: /Top Clusters/i })).toBeVisible();
    
    // Should show clusters or empty state
    await expect(page.locator('.clusters-list, .empty-clusters')).toBeVisible();
  });

  test('should display recent feedback section', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check recent feedback section
    await expect(page.getByRole('heading', { name: /Recent Feedback/i })).toBeVisible();
    
    // Should show feedback or empty state
    await expect(page.locator('.feedback-list, .empty-feedback')).toBeVisible();
  });

  test('should display source breakdown', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check source breakdown section
    await expect(page.getByRole('heading', { name: /Feedback by Source/i })).toBeVisible();
    
    // Should show chart or empty state
    await expect(page.locator('.source-chart, .empty-breakdown')).toBeVisible();
  });

  test('should display product area breakdown', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check product area breakdown section
    await expect(page.getByRole('heading', { name: /Feedback by Product Area/i })).toBeVisible();
    
    // Should show chart or empty state
    await expect(page.locator('.area-chart, .empty-breakdown')).toBeVisible();
  });

  test('should show getting started tips', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check getting started section
    await expect(page.getByRole('heading', { name: /Getting Started/i })).toBeVisible();
    await expect(page.getByText(/Add your first piece of feedback/i)).toBeVisible();
  });
}); 