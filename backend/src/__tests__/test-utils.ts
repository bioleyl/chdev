// biome-ignore-all lint/suspicious/noExplicitAny: test utility mocks don't match library types
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { vi } from 'vitest';
import type { EntityManager } from 'typeorm';
import type { BaseRepository } from '../common/base-repository.js';

const __testDir = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// EntityManager / Transaction mock helpers
// ---------------------------------------------------------------------------

export function createMockManager(): EntityManager {
  const m = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
  return m as unknown as EntityManager;
}

export function createMockTx(): EntityManager {
  return {
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    createQueryBuilder: vi.fn(),
  } as unknown as EntityManager;
}

export async function mockTx(mockManager: EntityManager, mode: 'resolved' | 'rejected' = 'resolved') {
  const { AppDataSource } = await import('../db/connection.js');
  const txMock = (AppDataSource as any).transaction;
  if (mode === 'rejected') {
    txMock.mockRejectedValue(new Error('Transaction failed'));
  } else {
    txMock.mockImplementation(async (fn: (tx: any) => Promise<any>) => fn(mockManager));
  }
}

// ---------------------------------------------------------------------------
// Repository mock helper
// ---------------------------------------------------------------------------

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function repositoryPath(name: string): string {
  const base = name.replace(/Repository$/, '');
  const filePath = join(__testDir, '..', 'repositories', `${toKebabCase(base)}.repository.js`);
  return pathToFileURL(filePath).href;
}

export async function mockRepository(name: string, methods: Record<string, any> = {}): Promise<any> {
  const mod = await import(repositoryPath(name));
  const RepoClass = mod[name as keyof typeof mod] as typeof BaseRepository;
  const repo = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    createQueryBuilder: vi.fn(),
    ...methods,
  };

  const createSpy = vi.fn().mockReturnValue(repo as any);

  // If RepoClass is already a vi.fn (from vi.mock at test level), attach the create spy
  if (typeof RepoClass === 'function' && 'mockImplementation' in RepoClass) {
    (RepoClass as any).create = createSpy;
  } else {
    vi.spyOn(RepoClass, 'create').mockImplementation(createSpy);
  }

  return repo;
}

// ---------------------------------------------------------------------------
// Controller mock helpers
// ---------------------------------------------------------------------------

export function createMockRes() {
  const jsonCalls: Array<{ status?: number; body?: unknown }> = [];
  const statusCalls: Array<number> = [];
  const sendCalls: Array<unknown> = [];
  const setHeaderCalls: Array<[string, string]> = [];

  const res: any = {
    _lastStatus: undefined as number | undefined,
    status: vi.fn().mockImplementation((status: number) => {
      statusCalls.push(status);
      res._lastStatus = status;
      return res;
    }),
    json: vi.fn().mockImplementation((body: unknown) => {
      jsonCalls.push({ status: res._lastStatus, body });
    }),
    send: vi.fn().mockImplementation((body: unknown) => {
      sendCalls.push(body);
    }),
    setHeader: vi.fn().mockImplementation((key: string, value: string) => {
      setHeaderCalls.push([key, value]);
    }),
  };

  return {
    res,
    getJsonCalls: () => jsonCalls,
    getStatusCalls: () => statusCalls,
    getSendCalls: () => sendCalls,
    getSetHeaderCalls: () => setHeaderCalls,
  };
}

export function createMockReq(
  options: {
    params?: Record<string, string>;
    query?: Record<string, unknown>;
    body?: unknown;
    user?: unknown;
  } = {}
) {
  return {
    params: options.params ?? {},
    query: options.query ?? {},
    body: options.body,
    headers: options.user ? { authorization: 'Bearer fake-token' } : {},
    user: options.user,
  };
}
