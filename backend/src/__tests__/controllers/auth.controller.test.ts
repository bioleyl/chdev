// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express/library types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authController } from '../../controllers/auth.controller.js';
import { createMockReq, createMockRes, mockRepository } from '../test-utils.js';
import type { Response } from 'express';

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

describe('Controller - Auth', () => {
  let mockRes: ReturnType<typeof createMockRes>;
  let res: Response;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRes = createMockRes();
    res = mockRes.res as unknown as Response;
  });

  async function getUserRepo(methods: Record<string, any> = {}) {
    return mockRepository('UserRepository', methods);
  }

  it('should return 401 when user not found on login', async () => {
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');
    vi.mocked(bcrypt.default.compare as any).mockResolvedValue(true);
    vi.mocked(jwt.default.sign as any).mockReturnValue('mock-token');

    await getUserRepo({ findByEmail: vi.fn().mockResolvedValue(null) });

    await authController.login(
      createMockReq({ body: { email: 'test@example.com', password: 'pass' } }) as any,
      res as any
    );

    expect(mockRes.getJsonCalls()).toEqual([{ status: 401, body: { error: 'Invalid credentials' } }]);
  });

  it('should return 401 when password is wrong on login', async () => {
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');
    vi.mocked(bcrypt.default.compare as any).mockResolvedValue(false);
    vi.mocked(jwt.default.sign as any).mockReturnValue('mock-token');

    await getUserRepo({
      findByEmail: vi.fn().mockResolvedValue({ id: 1, email: 'test@example.com', password: 'hashed' }),
    });

    await authController.login(
      createMockReq({ body: { email: 'test@example.com', password: 'wrong' } }) as any,
      res as any
    );

    expect(mockRes.getJsonCalls()).toEqual([{ status: 401, body: { error: 'Invalid credentials' } }]);
  });

  it('should return token and user info on successful login', async () => {
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');
    vi.mocked(bcrypt.default.compare as any).mockResolvedValue(true);
    vi.mocked(jwt.default.sign as any).mockReturnValue('mock-token');

    const user = { id: 1, email: 'test@example.com', password: 'hashed', role: 'ADMIN' };
    await getUserRepo({ findByEmail: vi.fn().mockResolvedValue(user) });

    await authController.login(
      createMockReq({ body: { email: 'test@example.com', password: 'pass' } }) as any,
      res as any
    );

    expect(mockRes.getJsonCalls()).toEqual([
      {
        status: undefined,
        body: { token: 'mock-token', user: { id: 1, email: 'test@example.com', role: 'ADMIN' } },
      },
    ]);
  });

  it('should call findByEmail with correct email on login', async () => {
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');
    vi.mocked(bcrypt.default.compare as any).mockResolvedValue(true);
    vi.mocked(jwt.default.sign as any).mockReturnValue('mock-token');

    const user = { id: 1, email: 'test@example.com', password: 'hashed', role: 'VIEWER' };
    const userRepo = await getUserRepo({ findByEmail: vi.fn().mockResolvedValue(user) });

    await authController.login(
      createMockReq({ body: { email: 'test@example.com', password: 'pass' } }) as any,
      res as any
    );

    expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should return user info from req.user on me', async () => {
    const req = createMockReq({ user: { id: 1, email: 'test@example.com', role: 'ADMIN' } });

    await authController.me(req as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([
      { status: undefined, body: { id: 1, email: 'test@example.com', role: 'ADMIN' } },
    ]);
  });

  it('should return different user info based on role', async () => {
    const req = createMockReq({ user: { id: 2, email: 'editor@example.com', role: 'EDITOR' } });

    await authController.me(req as any, res as any);

    expect(mockRes.getJsonCalls()).toEqual([
      { status: undefined, body: { id: 2, email: 'editor@example.com', role: 'EDITOR' } },
    ]);
  });
});
