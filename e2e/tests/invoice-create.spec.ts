import { test, request } from '@playwright/test';
import { readAuthToken } from './fixtures/auth.fixture.js';

const API_BASE = '/api';

test.describe('Invoice Create', () => {
  let token = '';

  test.beforeAll(() => {
    const auth = readAuthToken();
    if (!auth) {
      throw new Error('Auth token not found. Make sure the backend is running and seeded.');
    }
    token = auth.token;
  });

  test('should create an invoice via API and verify it exists', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });

    try {
      // Use seeded data: client id=1, prestation id=1
      const clientId = 1;
      const prestationId = 1;

      // Step 1: Create an invoice via API
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
              quantity: 5,
              unitPrice: 150,
            },
          ],
        },
      });

      // Assert creation succeeded
      test.expect(createResponse.status()).toBe(201);

      const createdInvoice = await createResponse.json() as {
        id: number;
        number: string;
        clientId: number;
        status: string;
        total: number;
        lines: Array<{ id: number; prestationId: number; quantity: number; unitPrice: number; description?: string }>;
      };

      test.expect(createdInvoice.id).toBeGreaterThan(0);
      test.expect(createdInvoice.number).toBeTruthy();
      test.expect(createdInvoice.clientId).toBe(clientId);
      test.expect(createdInvoice.status).toBe('DRAFT');
      test.expect(createdInvoice.total).toBe(750); // 5 * 150
      test.expect(createdInvoice.lines.length).toBe(1);
      test.expect(createdInvoice.lines[0].prestationId).toBe(prestationId);

      // Step 2: Verify the invoice exists via GET
      const getResponse = await api.get(`${API_BASE}/invoices/${createdInvoice.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      test.expect(getResponse.status()).toBe(200);

      const fetchedInvoice = await getResponse.json() as typeof createdInvoice;

      test.expect(fetchedInvoice.id).toBe(createdInvoice.id);
      test.expect(fetchedInvoice.status).toBe('DRAFT');
      test.expect(fetchedInvoice.lines.length).toBeGreaterThan(0);
    } finally {
      await api.dispose();
    }
  });

  test('should create an invoice with multiple line items', async () => {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });

    try {
      // Use seeded data
      const clientId = 1;
      const prestationId1 = 1;
      const prestationId2 = 2;

      const createResponse = await api.post(`${API_BASE}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          clientId,
          lines: [
            {
              prestationId: prestationId1,
              quantity: 3,
              unitPrice: 200,
            },
            {
              prestationId: prestationId2,
              quantity: 2,
              unitPrice: 100,
              description: 'Additional service',
            },
          ],
        },
      });

      // Assert creation succeeded
      test.expect(createResponse.status()).toBe(201);

      const createdInvoice = await createResponse.json() as {
        id: number;
        lines: Array<{ id: number; prestationId: number; quantity: number; unitPrice: number; description?: string }>;
      };

      test.expect(createdInvoice.id).toBeGreaterThan(0);
      test.expect(createdInvoice.lines.length).toBe(2);
      test.expect(createdInvoice.lines[0].prestationId).toBe(prestationId1);
      test.expect(createdInvoice.lines[1].prestationId).toBe(prestationId2);
      test.expect(createdInvoice.lines[1].description).toBe('Additional service');
    } finally {
      await api.dispose();
    }
  });
});
