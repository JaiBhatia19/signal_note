import { test, expect } from '@playwright/test';

test.describe('Feedback Ingestion', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in real tests this would use actual auth
    await page.goto('/login');
    // This would be a real auth flow in production
  });

  test('should display feedback form tabs', async ({ page }) => {
    await page.goto('/ingest');
    
    // Check both tabs are present
    await expect(page.getByRole('tab', { name: /Manual Entry/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /CSV Upload/i })).toBeVisible();
  });

  test('should handle manual feedback entry', async ({ page }) => {
    await page.goto('/ingest');
    
    // Fill out manual form
    await page.getByLabel(/Feedback text/i).fill('This is a test feedback message');
    await page.getByLabel(/Source/i).selectOption('email');
    await page.getByLabel(/User Segment/i).selectOption('enterprise');
    await page.getByLabel(/Product Area/i).selectOption('dashboard');
    
    // Submit form
    await page.getByRole('button', { name: /Submit Feedback/i }).click();
    
    // Should show success message
    await expect(page.getByText(/Feedback submitted successfully/i)).toBeVisible();
  });

  test('should handle CSV upload', async ({ page }) => {
    await page.goto('/ingest');
    
    // Switch to CSV tab
    await page.getByRole('tab', { name: /CSV Upload/i }).click();
    
    // Check CSV format guidelines are displayed
    await expect(page.getByText(/CSV Format/i)).toBeVisible();
    await expect(page.getByText(/source,user_segment,product_area,text,created_at/i)).toBeVisible();
    
    // Check file input is present
    await expect(page.getByLabel(/Upload CSV file/i)).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/ingest');
    
    // Submit empty form
    await page.getByRole('button', { name: /Submit Feedback/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/Feedback text is required/i)).toBeVisible();
  });
}); 