import type { Page } from '@playwright/test';

export const API = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3001/api/v1';

export const MOCK_USER = {
  id: 'user-e2e-01',
  email: 'e2etest@trocalia.com.ar',
  username: 'e2etest',
  role: 'user',
  kycLevel: 0,
  tokenBalance: 5,
  avatarUrl: null,
  isVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const MOCK_LISTING = {
  id: 'listing-e2e-01',
  title: 'Bicicleta de montaña rodado 29',
  description: 'Bicicleta en excelente estado, poco uso.',
  price: 150000,
  currency: 'ARS',
  negotiable: false,
  province: 'Buenos Aires',
  city: 'Palermo',
  condition: 'used',
  type: 'standard',
  status: 'approved',
  images: [],
  paymentMethods: ['Efectivo'],
  shippingOptions: ['Encuentro en persona'],
  shippingDescription: '',
  viewCount: 5,
  isCollectible: false,
  attributes: {},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  seller: MOCK_USER,
};

export async function mockAuthenticatedUser(page: Page) {
  await page.route(`${API}/auth/me`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USER),
    })
  );
  await page.route(`${API}/auth/refresh`, (route) =>
    route.fulfill({ status: 401, body: '{}' })
  );
}

export async function mockListingsEndpoint(page: Page, data = [MOCK_LISTING]) {
  await page.route(`${API}/listings**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data, total: data.length, nextCursor: null }),
    })
  );
}

export async function mockWalletBalance(page: Page, balance = 5) {
  await page.route(`${API}/wallet/balance`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ balance }),
    })
  );
}

export async function mockCategoriesEndpoint(page: Page) {
  await page.route(`${API}/categories**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  );
}

export async function mockNotificationsEndpoint(page: Page) {
  await page.route(`${API}/notifications**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], total: 0, nextCursor: null }),
    })
  );
}
