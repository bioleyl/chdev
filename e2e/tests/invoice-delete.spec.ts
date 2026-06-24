import { test, request } from '@playwright/test';
import { readAuthToken } from './fixtures/auth.fixture.js';

const API_BASE = '/api';

test.describe('Invoice Delete', () => {
  let token = '';

  test.beforeAll(() => {
    const auth = readAuthToken();
    if (!auth) {
      throw new Error('Auth token not found. Make sure the backend is running and seeded.');
    }
    token = auth.token;
  });

  test('should create, then delete an invoice and verify it is removed', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });

    try {
      // Use seeded data: client id=1, prestation id=1
      const clientId = 1;
      const prestationId = 1;

      // Step 1: Create a new invoice via API and capture its id
      const createResponse = await api.post(`${API_BASE}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          clientId,
          lines: [
            {
              prestationId,
              quantity: 2,
              unitPrice: 100,
            },
          ],
        },
      });

      test.expect(createResponse.status()).toBe(201);

      const createdInvoice = await createResponse.json() as { id: number };
      const invoiceId = createdInvoice.id;

      test.expect(invoiceId).toBeGreaterThan(0);

      // Step 2: Verify the invoice exists before deletion
      const getBeforeResponse = await api.get(`${API_BASE}/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      test.expect(getBeforeResponse.status()).toBe(200);

      // Step 3: Delete the invoice via API
      const deleteResponse = await api.delete(`${API_BASE}/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert deletion succeeded (204 No Content)
      test.expect(deleteResponse.status()).toBe(204);

      // Step 4: Verify deletion — GET should return 404
      const getAfterResponse = await api.get(`${API_BASE}/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      test.expect(getAfterResponse.status()).toBe(404);

      const errorBody = await getAfterResponse.json().catch(() => ({}));
      test.expect(errorBody).toHaveProperty('error');
    } finally {
      await api.dispose();
    }
  });

  test('should return 404 when deleting a non-existent invoice', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });

    try {
      const deleteResponse = await api.delete(`${API_BASE}/invoices/999999`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      test.expect(deleteResponse.status()).toBe(404);
    } finally {
      await api.dispose();
    }
  });
});
