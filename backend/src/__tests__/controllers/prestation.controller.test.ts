// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prestationController } from '../../controllers/prestation.controller.js';
import { createMockReq, createMockRes, mockRepository } from '../test-utils.js';
import type { Response } from 'express';

vi.mock('../../helpers/with-transaction.helper.js', () => ({
  withTransaction: vi.fn(),
}));

describe('Controller - Prestation', () => {
  let mockRes: ReturnType<typeof createMockRes>;
  let res: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = createMockRes();
    res = mockRes.res as unknown as Response;
  });

  async function getPrestationRepo(methods: Record<string, any> = {}) {
    return mockRepository('PrestationRepository', methods);
  }

  it('should return all prestations on getAll', async () => {
    const mockPrestations = [{ id: 1, label: 'Development' }];
    const repo = await getPrestationRepo({ findAll: vi.fn().mockResolvedValue(mockPrestations) });

    await prestationController.getAll(createMockReq() as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ body: mockPrestations }]);
    expect(repo.findAll).toHaveBeenCalled();
  });

  it('should return paginated prestations on getAllPaginated', async () => {
    await getPrestationRepo({ findAllPaginated: vi.fn().mockResolvedValue([[{ id: 1 }], 5]) });

    await prestationController.getAllPaginated({ query: { skip: 0, take: 10 } } as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ body: { data: [{ id: 1 }], total: 5 } }]);
  });

  it('should return prestation by id on getById', async () => {
    const mockPrestation = { id: 1, label: 'Development' };
    await getPrestationRepo({ findById: vi.fn().mockResolvedValue(mockPrestation) });

    await prestationController.getById(createMockReq({ params: { id: '1' } }) as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ body: mockPrestation }]);
  });

  it('should return 404 when prestation not found on getById', async () => {
    await getPrestationRepo({ findById: vi.fn().mockResolvedValue(null) });

    await prestationController.getById(createMockReq({ params: { id: '999' } }) as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ status: 404, body: { error: 'Not found' } }]);
  });

  it('should create a prestation on create', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    const mockPrestation = { id: 1, label: 'New Service', unit: 'U' };
    vi.mocked(withTransaction).mockResolvedValue(mockPrestation);

    await prestationController.create(
      createMockReq({ body: { label: 'New Service', unitPrice: 150 } }) as any,
      res as any
    );

    expect(mockRes.getStatusCalls()).toContain(201);
    expect(mockRes.getJsonCalls()).toEqual([{ status: 201, body: mockPrestation }]);
  });

  it('should update a prestation on update', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    const mockPrestation = { id: 1, label: 'Updated Service' };
    vi.mocked(withTransaction).mockResolvedValue(mockPrestation);

    await prestationController.update(
      createMockReq({ params: { id: '1' }, body: { label: 'Updated Service' } }) as any,
      res as any
    );

    expect(mockRes.getJsonCalls()).toEqual([{ body: mockPrestation }]);
  });

  it('should return 404 when updating a non-existent prestation', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    vi.mocked(withTransaction).mockResolvedValue(null);

    await prestationController.update(
      createMockReq({ params: { id: '999' }, body: { label: 'Updated' } }) as any,
      res as any
    );

    expect(mockRes.getJsonCalls()).toEqual([{ status: 404, body: { error: 'Not found' } }]);
  });

  it('should delete a prestation on remove', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    vi.mocked(withTransaction).mockResolvedValue({ affected: 1 });

    await prestationController.remove(createMockReq({ params: { id: '1' } }) as any, res as any);

    expect(mockRes.getStatusCalls()).toContain(204);
    expect(mockRes.getSendCalls().length).toBe(1);
  });

  it('should return 404 when deleting a non-existent prestation', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    vi.mocked(withTransaction).mockResolvedValue({ affected: 0 });

    await prestationController.remove(createMockReq({ params: { id: '999' } }) as any, res as any);

    expect(mockRes.getStatusCalls()).toContain(404);
    expect(mockRes.getJsonCalls()).toEqual([{ status: 404, body: { error: 'Not found' } }]);
  });
});
