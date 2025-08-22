import { test, expect } from '@playwright/test';

test.describe('Insights and Clustering', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in real tests this would use actual auth
    await page.goto('/login');
    // This would be a real auth flow in production
  });

  test('should display insights page', async ({ page }) => {
    await page.goto('/insights');
    
    // Check main elements
    await expect(page.getByRole('heading', { name: /AI-Powered Insights/i })).toBeVisible();
    await expect(page.getByText(/Discover patterns in your feedback/i)).toBeVisible();
  });

  test('should display cluster controls', async ({ page }) => {
    await page.goto('/insights');
    
    // Check rebuild clusters section
    await expect(page.getByRole('heading', { name: /Rebuild Clusters/i })).toBeVisible();
    await expect(page.getByLabel(/Number of clusters/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Rebuild Clusters/i })).toBeVisible();
  });

  test('should handle cluster rebuilding', async ({ page }) => {
    await page.goto('/insights');
    
    // Select number of clusters
    await page.getByLabel(/Number of clusters/i).selectOption('3');
    
    // Click rebuild button
    await page.getByRole('button', { name: /Rebuild Clusters/i }).click();
    
    // Should show processing message or success
    await expect(page.locator('.processing, .success')).toBeVisible();
  });

  test('should display existing clusters', async ({ page }) => {
    await page.goto('/insights');
    
    // Check clusters section
    await expect(page.getByRole('heading', { name: /Your Clusters/i })).toBeVisible();
    
    // Should show clusters or empty state
    await expect(page.locator('.clusters-grid, .empty-clusters')).toBeVisible();
  });

  test('should show cluster details', async ({ page }) => {
    await page.goto('/insights');
    
    // If clusters exist, check their details
    const clusterCards = page.locator('.cluster-card');
    if (await clusterCards.count() > 0) {
      // Check first cluster has required elements
      const firstCluster = clusterCards.first();
      await expect(firstCluster.locator('.cluster-label')).toBeVisible();
      await expect(firstCluster.locator('.cluster-size')).toBeVisible();
      await expect(firstCluster.locator('.avg-sentiment')).toBeVisible();
      await expect(firstCluster.locator('.avg-urgency')).toBeVisible();
    }
  });

  test('should show empty state when no clusters', async ({ page }) => {
    await page.goto('/insights');
    
    // If no clusters, should show empty state
    const emptyState = page.locator('.empty-clusters');
    if (await emptyState.isVisible()) {
      await expect(page.getByText(/No clusters found/i)).toBeVisible();
      await expect(page.getByText(/Add some feedback first/i)).toBeVisible();
    }
  });

  test('should display clustering tips', async ({ page }) => {
    await page.goto('/insights');
    
    // Check tips section
    await expect(page.getByText(/Clustering Tips/i)).toBeVisible();
    await expect(page.getByText(/More clusters = more granular insights/i)).toBeVisible();
  });
}); 