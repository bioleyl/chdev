// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrestationEntity } from '../../entities/prestation.entity.js';
import { PrestationRepository } from '../../repositories/prestation.repository.js';
import { createMockManager } from '../test-utils.js';

describe('Repository - Prestation', () => {
  let mockM: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockM = createMockManager();
  });

  function createRepo() {
    return new PrestationRepository(mockM as any);
  }

  it('should call transaction.find for findAll', async () => {
    const mockPrestation = { id: 1, label: 'Development' } as PrestationEntity;
    mockM.find.mockResolvedValue([mockPrestation]);

    const repo = createRepo();
    const result = await repo.findAll();

    expect(mockM.find).toHaveBeenCalledWith(PrestationEntity);
    expect(result).toEqual([mockPrestation]);
  });

  it('should call findOneBy for findById', async () => {
    const mockPrestation = { id: 1, label: 'Development' } as PrestationEntity;
    mockM.findOneBy.mockResolvedValue(mockPrestation);

    const repo = createRepo();
    const result = await repo.findById(1);

    expect(mockM.findOneBy).toHaveBeenCalledWith(PrestationEntity, { id: 1 });
    expect(result).toEqual(mockPrestation);
  });

  it('should return null when findById finds nothing', async () => {
    mockM.findOneBy.mockResolvedValue(null);

    const repo = createRepo();
    const result = await repo.findById(999);

    expect(mockM.findOneBy).toHaveBeenCalledWith(PrestationEntity, { id: 999 });
    expect(result).toBeNull();
  });

  it('should create with default unit U for create', async () => {
    const mockPrestation = { id: 1, label: 'Development', unit: 'H' } as PrestationEntity;
    mockM.create.mockReturnValue(mockPrestation);
    mockM.save.mockResolvedValue(mockPrestation);

    const repo = createRepo();
    const result = await repo.create({ label: 'Development', unitPrice: 150 } as any);

    expect(mockM.create).toHaveBeenCalledWith(PrestationEntity, {
      label: 'Development',
      unitPrice: 150,
      unit: 'U',
    });
    expect(mockM.save).toHaveBeenCalledWith(mockPrestation);
    expect(result).toEqual(mockPrestation);
  });

  it('should use provided unit if set for create', async () => {
    const mockPrestation = { id: 1, label: 'Development', unit: 'H' } as PrestationEntity;
    mockM.create.mockReturnValue(mockPrestation);
    mockM.save.mockResolvedValue(mockPrestation);

    const repo = createRepo();
    await repo.create({ label: 'Development', unitPrice: 150, unit: 'H' } as any);

    expect(mockM.create).toHaveBeenCalledWith(PrestationEntity, {
      label: 'Development',
      unitPrice: 150,
      unit: 'H',
    });
  });

  it('should save updated data for update', async () => {
    const mockPrestation = { id: 1, label: 'Updated' } as PrestationEntity;
    mockM.save.mockResolvedValue(mockPrestation);

    const repo = createRepo();
    const result = await repo.update(1, { label: 'Updated' });

    expect(mockM.save).toHaveBeenCalledWith(PrestationEntity, { id: 1, label: 'Updated' });
    expect(result).toEqual(mockPrestation);
  });

  it('should call transaction.delete for delete', async () => {
    const mockDeleteResult = { affected: 1 } as any;
    mockM.delete.mockResolvedValue(mockDeleteResult);

    const repo = createRepo();
    const result = await repo.delete(1);

    expect(mockM.delete).toHaveBeenCalledWith(PrestationEntity, 1);
    expect(result).toEqual(mockDeleteResult);
  });
});
