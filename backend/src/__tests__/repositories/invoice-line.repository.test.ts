// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvoiceLineEntity } from '../../entities/invoice-line.entity.js';
import { InvoiceLineRepository } from '../../repositories/invoice-line.repository.js';
import { createMockManager } from '../test-utils.js';

describe('Repository - InvoiceLine', () => {
  let mockM: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockM = createMockManager();
  });

  function createRepo() {
    return new InvoiceLineRepository(mockM as any);
  }

  it('should call transaction.find for findAll', async () => {
    const mockLine = { id: 1, invoiceId: 1, prestationId: 1, quantity: 2, unitPrice: 100 } as InvoiceLineEntity;
    mockM.find.mockResolvedValue([mockLine]);

    const repo = createRepo();
    const result = await repo.findAll();

    expect(mockM.find).toHaveBeenCalledWith(InvoiceLineEntity, { relations: ['invoice', 'prestation'] });
    expect(result).toEqual([mockLine]);
  });

  it('should call transaction.findOne for findById', async () => {
    const mockLine = { id: 1, invoiceId: 1 } as InvoiceLineEntity;
    mockM.findOne.mockResolvedValue(mockLine);

    const repo = createRepo();
    const result = await repo.findById(1);

    expect(mockM.findOne).toHaveBeenCalledWith(InvoiceLineEntity, {
      where: { id: 1 },
      relations: ['invoice', 'prestation'],
    });
    expect(result).toEqual(mockLine);
  });

  it('should call transaction.find for findByInvoiceId', async () => {
    const mockLine = { id: 1, invoiceId: 5 } as InvoiceLineEntity;
    mockM.find.mockResolvedValue([mockLine]);

    const repo = createRepo();
    const result = await repo.findByInvoiceId(5);

    expect(mockM.find).toHaveBeenCalledWith(InvoiceLineEntity, {
      where: { invoiceId: 5 },
      relations: ['prestation'],
    });
    expect(result).toEqual([mockLine]);
  });

  it('should return paginated results for findByInvoiceIdPaginated', async () => {
    const mockLine = { id: 1, invoiceId: 5 } as InvoiceLineEntity;
    mockM.find.mockResolvedValue([mockLine]);
    mockM.count.mockResolvedValue(10);

    const repo = createRepo();
    const [results, total] = await repo.findByInvoiceIdPaginated(5, { skip: 0, take: 10 });

    expect(mockM.find).toHaveBeenCalledWith(InvoiceLineEntity, {
      where: { invoiceId: 5 },
      skip: 0,
      take: 10,
      relations: ['prestation'],
    });
    expect(mockM.count).toHaveBeenCalledWith(InvoiceLineEntity, { where: { invoiceId: 5 } });
    expect(results).toEqual([mockLine]);
    expect(total).toBe(10);
  });

  it('should create and save for create', async () => {
    const mockLine = { id: 1, invoiceId: 1, prestationId: 1, quantity: 2, unitPrice: 100 } as InvoiceLineEntity;
    mockM.create.mockReturnValue(mockLine);
    mockM.save.mockResolvedValue(mockLine);

    const repo = createRepo();
    const result = await repo.create({ invoiceId: 1, prestationId: 1, quantity: 2, unitPrice: 100 });

    expect(mockM.create).toHaveBeenCalledWith(InvoiceLineEntity, {
      invoiceId: 1,
      prestationId: 1,
      quantity: 2,
      unitPrice: 100,
    });
    expect(mockM.save).toHaveBeenCalledWith(mockLine);
    expect(result).toEqual(mockLine);
  });

  it('should call transaction.delete for delete', async () => {
    const mockDeleteResult = { affected: 1 } as any;
    mockM.delete.mockResolvedValue(mockDeleteResult);

    const repo = createRepo();
    const result = await repo.delete(1);

    expect(mockM.delete).toHaveBeenCalledWith(InvoiceLineEntity, 1);
    expect(result).toEqual(mockDeleteResult);
  });

  it('should call transaction.delete by invoiceId for deleteByInvoiceId', async () => {
    const mockDeleteResult = { affected: 3 } as any;
    mockM.delete.mockResolvedValue(mockDeleteResult);

    const repo = createRepo();
    const result = await repo.deleteByInvoiceId(5);

    expect(mockM.delete).toHaveBeenCalledWith(InvoiceLineEntity, { invoiceId: 5 });
    expect(result).toEqual(mockDeleteResult);
  });
});
