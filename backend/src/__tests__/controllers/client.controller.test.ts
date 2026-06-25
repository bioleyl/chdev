// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clientController } from '../../controllers/client.controller.js';
import { createMockReq, createMockRes, mockRepository } from '../test-utils.js';
import type { Response } from 'express';

vi.mock('../../helpers/with-transaction.helper.js', () => ({
  withTransaction: vi.fn(),
}));

describe('Controller - Client', () => {
  let mockRes: ReturnType<typeof createMockRes>;
  let res: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = createMockRes();
    res = mockRes.res as unknown as Response;
  });

  async function getClientRepo(methods: Record<string, any> = {}) {
    return mockRepository('ClientRepository', methods);
  }

  it('should return all clients on getAll', async () => {
    const mockClients = [{ id: 1, companyName: 'Test Corp' }];
    const clientRepo = await getClientRepo({ findAll: vi.fn().mockResolvedValue(mockClients) });

    await clientController.getAll(createMockReq() as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ body: mockClients }]);
    expect(clientRepo.findAll).toHaveBeenCalled();
  });

  it('should return paginated clients on getAllPaginated', async () => {
    await getClientRepo({ findAllPaginated: vi.fn().mockResolvedValue([[{ id: 1 }], 5]) });

    await clientController.getAllPaginated({ query: { skip: 0, take: 10 } } as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ body: { data: [{ id: 1 }], total: 5 } }]);
  });

  it('should return client by id on getById', async () => {
    const mockClient = { id: 1, companyName: 'Test Corp' };
    await getClientRepo({ findById: vi.fn().mockResolvedValue(mockClient) });

    await clientController.getById(createMockReq({ params: { id: '1' } }) as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ body: mockClient }]);
  });

  it('should return 404 when client not found on getById', async () => {
    await getClientRepo({ findById: vi.fn().mockResolvedValue(null) });

    await clientController.getById(createMockReq({ params: { id: '999' } }) as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([{ status: 404, body: { error: 'Not found' } }]);
  });

  it('should create a client on create', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    const mockClient = { id: 1, companyName: 'New Corp' };
    vi.mocked(withTransaction).mockResolvedValue(mockClient);

    await clientController.create(createMockReq({ body: { companyName: 'New Corp' } }) as any, res as any);

    expect(mockRes.getStatusCalls()).toContain(201);
    expect(mockRes.getJsonCalls()).toEqual([{ status: 201, body: mockClient }]);
  });

  it('should update a client on update', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    const mockClient = { id: 1, companyName: 'Updated Corp' };
    vi.mocked(withTransaction).mockResolvedValue(mockClient);

    await clientController.update(
      createMockReq({ params: { id: '1' }, body: { companyName: 'Updated Corp' } }) as any,
      res as any
    );

    expect(mockRes.getJsonCalls()).toEqual([{ body: mockClient }]);
  });

  it('should return 404 when updating a non-existent client', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    vi.mocked(withTransaction).mockResolvedValue(null);

    await clientController.update(
      createMockReq({ params: { id: '999' }, body: { companyName: 'Updated' } }) as any,
      res as any
    );

    expect(mockRes.getJsonCalls()).toEqual([{ status: undefined, body: null }]);
  });

  it('should delete a client on remove', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    vi.mocked(withTransaction).mockResolvedValue({ affected: 1 });

    await clientController.remove(createMockReq({ params: { id: '1' } }) as any, res as any);

    expect(mockRes.getStatusCalls()).toContain(204);
    expect(mockRes.getSendCalls().length).toBe(1);
  });

  it('should return 404 when deleting a non-existent client', async () => {
    const { withTransaction } = await import('../../helpers/with-transaction.helper.js');
    vi.mocked(withTransaction).mockResolvedValue({ affected: 0 });

    await clientController.remove(createMockReq({ params: { id: '999' } }) as any, res as any);

    expect(mockRes.getStatusCalls()).toContain(404);
    expect(mockRes.getJsonCalls()).toEqual([{ status: 404, body: { error: 'Not found' } }]);
  });
});
