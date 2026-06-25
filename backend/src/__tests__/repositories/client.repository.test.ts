// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClientEntity } from '../../entities/client.entity.js';
import { ClientRepository } from '../../repositories/client.repository.js';
import { createMockManager } from '../test-utils.js';

describe('Repository - Client', () => {
  let mockM: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockM = createMockManager();
  });

  function createRepo() {
    return new ClientRepository(mockM as any);
  }

  it('should call transaction.find for findAll', async () => {
    const mockClient = { id: 1, companyName: 'Test Corp' } as ClientEntity;
    mockM.find.mockResolvedValue([mockClient]);

    const repo = createRepo();
    const result = await repo.findAll();

    expect(mockM.find).toHaveBeenCalledWith(ClientEntity);
    expect(result).toEqual([mockClient]);
  });

  it('should call transaction.findOne for findById', async () => {
    const mockClient = { id: 1, companyName: 'Test Corp' } as ClientEntity;
    mockM.findOne.mockResolvedValue(mockClient);

    const repo = createRepo();
    const result = await repo.findById(1);

    expect(mockM.findOne).toHaveBeenCalledWith(ClientEntity, { where: { id: 1 }, relations: ['invoices'] });
    expect(result).toEqual(mockClient);
  });

  it('should return null when findById finds nothing', async () => {
    mockM.findOne.mockResolvedValue(null);

    const repo = createRepo();
    const result = await repo.findById(999);

    expect(mockM.findOne).toHaveBeenCalledWith(ClientEntity, { where: { id: 999 }, relations: ['invoices'] });
    expect(result).toBeNull();
  });

  it('should call transaction.create and save for create', async () => {
    const mockClient = { id: 1, companyName: 'New Corp' } as ClientEntity;
    mockM.create.mockReturnValue(mockClient);
    mockM.save.mockResolvedValue(mockClient);
    mockM.findOne.mockResolvedValue(mockClient);

    const repo = createRepo();
    const result = await repo.create({ companyName: 'New Corp' });

    expect(mockM.create).toHaveBeenCalledWith(ClientEntity, { companyName: 'New Corp' });
    expect(mockM.save).toHaveBeenCalledWith(mockClient);
    expect(result).toEqual(mockClient);
  });

  it('should call transaction.update and findById for update', async () => {
    const mockClient = { id: 1, companyName: 'Updated Corp' } as ClientEntity;
    mockM.update.mockResolvedValue({} as any);
    mockM.findOne.mockResolvedValue(mockClient);

    const repo = createRepo();
    const result = await repo.update(1, { companyName: 'Updated Corp' });

    expect(mockM.update).toHaveBeenCalledWith(ClientEntity, 1, { companyName: 'Updated Corp' });
    expect(mockM.findOne).toHaveBeenCalledWith(ClientEntity, { where: { id: 1 }, relations: ['invoices'] });
    expect(result).toEqual(mockClient);
  });

  it('should call transaction.delete for delete', async () => {
    const mockDeleteResult = { affected: 1 } as any;
    mockM.delete.mockResolvedValue(mockDeleteResult);

    const repo = createRepo();
    const result = await repo.delete(1);

    expect(mockM.delete).toHaveBeenCalledWith(ClientEntity, 1);
    expect(result).toEqual(mockDeleteResult);
  });

  it('should call transaction.findOne with relations for findInvoicesByClientId', async () => {
    const mockClient = {
      id: 1,
      invoices: [{ id: 1, number: '2024-0001' }] as any,
    } as ClientEntity;
    mockM.findOne.mockResolvedValue(mockClient);

    const repo = createRepo();
    const result = await repo.findInvoicesByClientId(1);

    expect(mockM.findOne).toHaveBeenCalledWith(ClientEntity, {
      where: { id: 1 },
      relations: ['invoices', 'invoices.lines', 'invoices.client'],
    });
    expect(result).toEqual([{ id: 1, number: '2024-0001' }]);
  });

  it('should return null when findInvoicesByClientId finds no client', async () => {
    mockM.findOne.mockResolvedValue(null);

    const repo = createRepo();
    const result = await repo.findInvoicesByClientId(999);

    expect(result).toBeNull();
  });
});
