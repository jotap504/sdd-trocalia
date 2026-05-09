import { test, expect } from '@playwright/test';
import { MOCK_LISTING, mockListingsEndpoint } from './helpers/api-mocks';

test.describe('Listings page — E2E-02', () => {
  test('page loads with title when no data', async ({ page }) => {
    await mockListingsEndpoint(page, []);
    await page.goto('/listings');
    await expect(
      page.getByRole('heading', { name: 'Todas las publicaciones' })
    ).toBeVisible();
  });

  test('shows listing cards when API returns data', async ({ page }) => {
    await mockListingsEndpoint(page, [MOCK_LISTING]);
    await page.goto('/listings');
    await expect(
      page.locator('[data-testid=listing-card]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('E2E-02: listing cards show province in location', async ({ page }) => {
    await mockListingsEndpoint(page, [MOCK_LISTING]);
    await page.goto('/listings?province=Buenos+Aires');

    await expect(
      page.locator('[data-testid=listing-card]').first()
    ).toBeVisible({ timeout: 10000 });

    const locations = await page
      .locator('[data-testid=listing-location]')
      .allTextContents();
    expect(
      locations.every(
        (loc) => loc.includes('Buenos Aires') || loc.includes('Palermo')
      )
    ).toBe(true);
  });

  test('shows search query in heading', async ({ page }) => {
    await mockListingsEndpoint(page, []);
    await page.goto('/listings?q=bicicleta');
    await expect(
      page.getByRole('heading', { name: /bicicleta/i })
    ).toBeVisible();
  });

  test('shows empty state message when no listings', async ({ page }) => {
    await mockListingsEndpoint(page, []);
    await page.goto('/listings');
    await expect(
      page.locator('text=No encontramos publicaciones')
    ).toBeVisible({ timeout: 10000 });
  });

  test('filter panel renders on desktop viewport', async ({ page }) => {
    await mockListingsEndpoint(page, []);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/listings');
    await expect(page.locator('.lg\\:block').first()).toBeVisible();
  });
});
