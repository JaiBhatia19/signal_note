import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Create test user via API
    const response = await page.request.post('/api/test-user', {
      data: {
        email: 'test@example.com',
        password: 'testpassword123'
      }
    });
    
    const result = await response.json();
    expect(result.success).toBe(true);
    
    // Navigate to login page and authenticate
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill in test credentials and sign in
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for authentication to complete and any redirect
    await page.waitForTimeout(3000);
    
    // If not on dashboard yet, navigate there
    if (!page.url().includes('/dashboard')) {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display dashboard elements', async ({ page }) => {
    // Don't navigate again, we should already be authenticated and on dashboard
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-dashboard.png' });
    
    // Log page content for debugging
    const content = await page.content();
    console.log('Page content preview:', content.substring(0, 1000));
    
    // Check what text is actually on the page
    const bodyText = await page.locator('body').textContent();
    console.log('Body text preview:', bodyText?.substring(0, 500));
    
    // Check main dashboard elements - look for "Welcome back" instead of "Dashboard"
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
    
    // Check KPI cards
    await expect(page.getByText(/Total Feedback/i)).toBeVisible();
    await expect(page.getByText(/Avg Sentiment/i)).toBeVisible();
    await expect(page.getByText(/Avg Urgency/i)).toBeVisible();
    await expect(page.getByText(/Clusters/i)).toBeVisible();
  });

  test('should display top clusters section', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check clusters section
    await expect(page.getByRole('heading', { name: /Top Clusters/i })).toBeVisible();
    
    // Should show clusters or empty state
    await expect(page.locator('.clusters-list, .empty-clusters, text=No clusters yet')).toBeVisible();
  });

  test('should display recent feedback section', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check recent feedback section
    await expect(page.getByRole('heading', { name: /Recent Feedback/i })).toBeVisible();
    
    // Should show feedback or empty state
    await expect(page.locator('.feedback-list, .empty-feedback, text=No feedback yet')).toBeVisible();
  });

  test('should display source breakdown', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check source breakdown section
    await expect(page.getByRole('heading', { name: /Feedback by Source/i })).toBeVisible();
    
    // Should show chart or empty state
    await expect(page.locator('.source-chart, .empty-breakdown')).toBeVisible();
  });

  test('should display product area breakdown', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check product area breakdown section
    await expect(page.getByRole('heading', { name: /Feedback by Product Area/i })).toBeVisible();
    
    // Should show chart or empty state
    await expect(page.locator('.area-chart, .empty-breakdown')).toBeVisible();
  });

  test('should show getting started tips', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check getting started section - will show when user has < 5 feedback items
    const gettingStarted = page.getByRole('heading', { name: /Getting Started/i });
    const addFirstFeedback = page.getByText(/Add your first piece of feedback/i);
    
    // Should show getting started tips for new users OR dashboard content for users with data
    const gettingStartedVisible = await gettingStarted.isVisible();
    if (gettingStartedVisible) {
      await expect(addFirstFeedback).toBeVisible();
    } else {
      // If getting started is not visible, user has data, so main dashboard should be visible
      await expect(page.getByText(/Welcome back/i)).toBeVisible();
    }
  });
}); 