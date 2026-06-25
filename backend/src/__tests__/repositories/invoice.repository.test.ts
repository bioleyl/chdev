// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvoiceEntity } from '../../entities/invoice.entity.js';
import { InvoiceRepository } from '../../repositories/invoice.repository.js';
import { createMockManager } from '../test-utils.js';

describe('Repository - Invoice', () => {
  let mockM: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockM = createMockManager();
  });

  function createRepo() {
    return new InvoiceRepository(mockM as any);
  }

  it('should call transaction.find for findAll', async () => {
    const mockInvoice = { id: 1, number: '2024-0001' } as InvoiceEntity;
    mockM.find.mockResolvedValue([mockInvoice]);

    const repo = createRepo();
    const result = await repo.findAll();

    expect(mockM.find).toHaveBeenCalledWith(InvoiceEntity, { relations: ['lines', 'client'] });
    expect(result).toEqual([mockInvoice]);
  });

  it('should call transaction.findOne for findById', async () => {
    const mockInvoice = { id: 1, number: '2024-0001' } as InvoiceEntity;
    mockM.findOne.mockResolvedValue(mockInvoice);

    const repo = createRepo();
    const result = await repo.findById(1);

    expect(mockM.findOne).toHaveBeenCalledWith(InvoiceEntity, {
      where: { id: 1 },
      relations: ['lines', 'client', 'lines.prestation'],
    });
    expect(result).toEqual(mockInvoice);
  });

  it('should call transaction.findOne for findByNumber', async () => {
    const mockInvoice = { id: 1, number: '2024-0001' } as InvoiceEntity;
    mockM.findOne.mockResolvedValue(mockInvoice);

    const repo = createRepo();
    const result = await repo.findByNumber('2024-0001');

    expect(mockM.findOne).toHaveBeenCalledWith(InvoiceEntity, {
      where: { number: '2024-0001' },
      relations: ['lines', 'client'],
    });
    expect(result).toEqual(mockInvoice);
  });

  it('should call transaction.find for findByClientId', async () => {
    const mockInvoice = { id: 1, number: '2024-0001', clientId: 5 } as InvoiceEntity;
    mockM.find.mockResolvedValue([mockInvoice]);

    const repo = createRepo();
    const result = await repo.findByClientId(5);

    expect(mockM.find).toHaveBeenCalledWith(InvoiceEntity, {
      where: { clientId: 5 },
      relations: ['lines', 'client'],
    });
    expect(result).toEqual([mockInvoice]);
  });

  it('should return paginated results for findByClientIdPaginated', async () => {
    const mockInvoice = { id: 1, number: '2024-0001' } as InvoiceEntity;
    mockM.find.mockResolvedValue([mockInvoice]);
    mockM.count.mockResolvedValue(5);

    const repo = createRepo();
    const [results, total] = await repo.findByClientIdPaginated(5, {
      skip: 0,
      take: 10,
      order: { createdAt: 'ASC' },
    });

    expect(mockM.find).toHaveBeenCalledWith(InvoiceEntity, {
      where: { clientId: 5 },
      skip: 0,
      take: 10,
      relations: ['lines', 'client'],
      order: { createdAt: 'ASC' },
    });
    expect(mockM.count).toHaveBeenCalledWith(InvoiceEntity, { where: { clientId: 5 } });
    expect(results).toEqual([mockInvoice]);
    expect(total).toBe(5);
  });

  it('should create with calculated total and auto-number for create', async () => {
    const mockInvoice = { id: 1, number: '2024-0001', total: 300, status: 'DRAFT' } as InvoiceEntity;
    mockM.create.mockReturnValue(mockInvoice);
    mockM.save.mockResolvedValue(mockInvoice);

    // Mock createQueryBuilder chain for getNextInvoiceNumber
    const mockQB = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(null),
    };
    mockM.createQueryBuilder.mockReturnValue(mockQB);

    const repo = createRepo();
    const result = await repo.create({
      clientId: 1,
      lines: [{ prestationId: 1, quantity: 3, unitPrice: 100 }],
    });

    expect(mockM.save).toHaveBeenCalledWith(mockInvoice);
    expect(result).toEqual(mockInvoice);
  });

  it('should recalculate total from lines for create', async () => {
    const mockInvoice = { id: 1, total: 300, status: 'DRAFT' } as InvoiceEntity;
    mockM.create.mockReturnValue(mockInvoice);
    mockM.save.mockResolvedValue(mockInvoice);

    const mockQB = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(null),
    };
    mockM.createQueryBuilder.mockReturnValue(mockQB);

    const repo = createRepo();
    await repo.create({
      clientId: 1,
      lines: [{ prestationId: 1, quantity: 2, unitPrice: 150 }],
    });

    expect(mockM.save).toHaveBeenCalledWith(expect.objectContaining({ total: 300 }));
  });

  it('should handle empty lines array for create', async () => {
    const mockInvoice = { id: 1, total: 0, status: 'DRAFT' } as InvoiceEntity;
    mockM.create.mockReturnValue(mockInvoice);
    mockM.save.mockResolvedValue(mockInvoice);

    const mockQB = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(null),
    };
    mockM.createQueryBuilder.mockReturnValue(mockQB);

    const repo = createRepo();
    await repo.create({
      clientId: 1,
      lines: [],
    });

    expect(mockM.save).toHaveBeenCalledWith(expect.objectContaining({ total: 0 }));
  });

  it('should save updated data for update', async () => {
    const mockInvoice = { id: 1, total: 500 } as InvoiceEntity;
    mockM.save.mockResolvedValue(mockInvoice);

    const repo = createRepo();
    const result = await repo.update({ id: 1, lines: [{ prestationId: 1, quantity: 5, unitPrice: 100 }] });

    expect(mockM.save).toHaveBeenCalledWith(InvoiceEntity, {
      id: 1,
      lines: [{ prestationId: 1, quantity: 5, unitPrice: 100 }],
      total: 500,
    });
    expect(result).toEqual(mockInvoice);
  });

  it('should call transaction.delete for delete', async () => {
    const mockDeleteResult = { affected: 1 } as any;
    mockM.delete.mockResolvedValue(mockDeleteResult);

    const repo = createRepo();
    const result = await repo.delete(1);

    expect(mockM.delete).toHaveBeenCalledWith(InvoiceEntity, 1);
    expect(result).toEqual(mockDeleteResult);
  });

  it('should call createQueryBuilder for getNextInvoiceNumber', async () => {
    const mockLastInvoice = { id: 1, number: '2024-0010', createdAt: new Date() } as InvoiceEntity;
    const mockQB = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(mockLastInvoice),
    };
    mockM.createQueryBuilder.mockReturnValue(mockQB);

    const repo = createRepo();
    await (repo as any).getNextInvoiceNumber();
    expect(mockM.createQueryBuilder).toHaveBeenCalled();
  });
});
