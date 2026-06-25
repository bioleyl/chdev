// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invoiceController } from '../../controllers/invoice.controller.js';
import { createMockReq, createMockRes, mockRepository } from '../test-utils.js';
import type { Response } from 'express';

vi.mock('../../helpers/with-transaction.helper.js', () => ({
  withTransaction: vi.fn(),
}));

vi.mock('../../services/invoice-pdf.service.js', () => ({
  invoicePdfService: { generateInvoicePdf: vi.fn() },
  sanitizeFilename: vi.fn((name) => name),
}));

describe('Controller - Invoice', () => {
  let mockRes: ReturnType<typeof createMockRes>;
  let res: Response;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRes = createMockRes();
    res = mockRes.res as unknown as Response;
    const { sanitizeFilename } = await import('../../services/invoice-pdf.service.js');
    vi.mocked(sanitizeFilename).mockImplementation((name: string) => name);
  });

  async function getInvoiceRepo(methods: Record<string, any> = {}) {
    return mockRepository('InvoiceRepository', methods);
  }

  async function getInvoiceLineRepo(methods: Record<string, any> = {}) {
    return mockRepository('InvoiceLineRepository', methods);
  }

  it('should return all invoices on getAll', async () => {
    const mockInvoices = [{ id: 1, number: '2024-0001' }];
    const [invoiceRepo] = await Promise.all([
      getInvoiceRepo({ findAll: vi.fn().mockResolvedValue(mockInvoices) }),
      getInvoiceLineRepo(),
    ]);

    await invoiceController.getAll(createMockReq() as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ status: undefined, body: mockInvoices }]);
    expect(invoiceRepo.findAll).toHaveBeenCalled();
  });

  it('should return paginated invoices on getAllPaginated', async () => {
    const [_invoiceRepo] = await Promise.all([
      getInvoiceRepo({ findAllPaginated: vi.fn().mockResolvedValue([[{ id: 1 }], 5]) }),
      getInvoiceLineRepo(),
    ]);

    await invoiceController.getAllPaginated({ query: { skip: 0, take: 10 } } as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ status: undefined, body: { data: [{ id: 1 }], total: 5 } }]);
  });

  it('should return invoice by id on getById', async () => {
    const mockInvoice = { id: 1, number: '2024-0001' };
    await Promise.all([
      getInvoiceRepo({ findById: vi.fn().mockResolvedValue(mockInvoice) }),
      getInvoiceLineRepo(),
    ]);

    await invoiceController.getById(createMockReq({ params: { id: '1' } }) as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ status: undefined, body: mockInvoice }]);
  });

  it('should return 404 when invoice not found on getById', async () => {
    await Promise.all([getInvoiceRepo({ findById: vi.fn().mockResolvedValue(null) }), getInvoiceLineRepo()]);

    await invoiceController.getById(createMockReq({ params: { id: '999' } }) as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ status: 404, body: { error: 'Not found' } }]);
  });

  it('should create invoice with lines on create', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    const mockInvoice = { id: 1, number: '2024-0001', total: 500 };
    vi.mocked(withTransaction).mockResolvedValue(mockInvoice);

    await invoiceController.create(
      createMockReq({ body: { clientId: 1, lines: [{ prestationId: 1, quantity: 5, unitPrice: 100 }] } }) as any,
      res as any
    );

    expect(mockRes.getStatusCalls()).toContain(201);
    expect(mockRes.getJsonCalls()).toEqual([{ status: 201, body: mockInvoice }]);
  });

  it('should update invoice with new lines on update', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    const mockInvoice = { id: 1, number: '2024-0001', total: 1000 };
    vi.mocked(withTransaction).mockResolvedValue(mockInvoice);

    await invoiceController.update(
      createMockReq({
        params: { id: '1' },
        body: { clientId: 1, lines: [{ prestationId: 1, quantity: 10, unitPrice: 100 }] },
      }) as any,
      res as any
    );

    expect(mockRes.getJsonCalls()).toEqual([{ status: undefined, body: mockInvoice }]);
  });

  it('should return 404 when updating a non-existent invoice', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    vi.mocked(withTransaction).mockResolvedValue(undefined);

    await invoiceController.update(
      createMockReq({ params: { id: '999' }, body: { clientId: 1 } }) as any,
      res as any
    );

    expect(mockRes.getJsonCalls()).toEqual([{ status: undefined, body: undefined }]);
  });

  it('should delete an invoice on remove', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    vi.mocked(withTransaction).mockResolvedValue({ affected: 1 });

    await invoiceController.remove(createMockReq({ params: { id: '1' } }) as any, res as any);

    expect(mockRes.getStatusCalls()).toContain(204);
    expect(mockRes.getSendCalls().length).toBe(1);
  });

  it('should return 404 when deleting a non-existent invoice', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    vi.mocked(withTransaction).mockResolvedValue({ affected: 0 });

    await invoiceController.remove(createMockReq({ params: { id: '999' } }) as any, res as any);

    expect(mockRes.getStatusCalls()).toContain(404);
    expect(mockRes.getJsonCalls()).toEqual([{ status: 404, body: { error: 'Not found' } }]);
  });

  it('should generate PDF and return it on downloadPdf', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    const { invoicePdfService } = await import('../../services/invoice-pdf.service.js');
    const mockInvoice = { id: 1, number: '2024-0001', total: 500 };
    const mockPdfBuffer = Buffer.from('mock-pdf');

    vi.mocked(withTransaction).mockResolvedValue(mockInvoice);
    vi.mocked(invoicePdfService.generateInvoicePdf).mockResolvedValue(mockPdfBuffer);

    await invoiceController.downloadPdf(createMockReq({ params: { id: '1' } }) as any, res as any);

    expect(mockRes.getSetHeaderCalls()).toContainEqual(['Content-Type', 'application/pdf']);
    expect(mockRes.getSetHeaderCalls()).toContainEqual([
      'Content-Disposition',
      'attachment; filename="invoice-2024-0001.pdf"',
    ]);
    expect(mockRes.getSendCalls()).toHaveLength(1);
  });

  it('should return 404 when invoice not found on downloadPdf', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    vi.mocked(withTransaction).mockResolvedValue(null);

    await invoiceController.downloadPdf(createMockReq({ params: { id: '999' } }) as any, res as any);

    expect(mockRes.getStatusCalls()).toContain(404);
    expect(mockRes.getJsonCalls()).toEqual([{ status: 404, body: { error: 'Not found' } }]);
  });

  it('should sanitize filename in downloadPdf', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    const { invoicePdfService, sanitizeFilename } = await import('../../services/invoice-pdf.service.js');
    const mockInvoice = { id: 1, number: '2024-00:01', total: 500 };
    vi.mocked(withTransaction).mockResolvedValue(mockInvoice);
    vi.mocked(invoicePdfService.generateInvoicePdf).mockResolvedValue(Buffer.from('mock'));
    vi.mocked(sanitizeFilename).mockReturnValue('2024-00_01');

    await invoiceController.downloadPdf(createMockReq({ params: { id: '1' } }) as any, res as any);

    expect(sanitizeFilename).toHaveBeenCalledWith('2024-00:01');
    expect(mockRes.getSetHeaderCalls()).toContainEqual([
      'Content-Disposition',
      'attachment; filename="invoice-2024-00_01.pdf"',
    ]);
  });
});
