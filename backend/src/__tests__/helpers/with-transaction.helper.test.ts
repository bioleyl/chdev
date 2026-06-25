import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withTransaction } from '../../helpers/with-transaction.helper.js';
import { createMockTx, mockTx } from '../test-utils.js';

vi.mock('../../db/connection.js', () => ({
  AppDataSource: {
    transaction: vi.fn(),
  },
}));

describe('Helper - withTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call AppDataSource.transaction with the provided function', async () => {
    const mockManager = createMockTx();
    await mockTx(mockManager);
    const fn = vi.fn().mockResolvedValue({ result: 'success' });
    const result = await withTransaction(fn);

    expect(fn).toHaveBeenCalledWith(mockManager);
    expect(result).toEqual({ result: 'success' });
  });

  it('should return the result of the transaction function', async () => {
    const mockManager = createMockTx();
    await mockTx(mockManager);

    const expected = { id: 1, name: 'test' };
    const fn = vi.fn().mockResolvedValue(expected);
    const result = await withTransaction(fn);

    expect(result).toEqual(expected);
  });

  it('should propagate errors from the transaction', async () => {
    const mockManager = createMockTx();
    await mockTx(mockManager, 'rejected');

    await expect(withTransaction(vi.fn())).rejects.toThrow('Transaction failed');
  });

  it('should pass the transaction manager to the function', async () => {
    const mockManager = createMockTx();
    await mockTx(mockManager);

    const fn = vi.fn();
    await withTransaction(fn);

    expect(fn).toHaveBeenCalledWith(mockManager);
  });

  it('should support async operations within the transaction', async () => {
    const mockManager = createMockTx();
    await mockTx(mockManager);

    const fn = vi.fn().mockResolvedValue({ data: 'async-result' });
    const result = await withTransaction(async (_tx) => {
      return fn();
    });

    expect(fn).toHaveBeenCalled();
    expect(result).toEqual({ data: 'async-result' });
  });

  it('should handle transaction function that returns a promise', async () => {
    const mockManager = createMockTx();
    await mockTx(mockManager);

    // biome-ignore lint/suspicious/noExplicitAny: transaction manager mock needs flexible typing
    let txPassed: any = null;
    // biome-ignore lint/suspicious/noExplicitAny: transaction manager mock needs flexible typing
    const fn = vi.fn(async (tx: any) => {
      txPassed = tx;
      return 'resolved';
    });

    const result = await withTransaction(fn);
    expect(txPassed).toBe(mockManager);
    expect(result).toBe('resolved');
  });
});
