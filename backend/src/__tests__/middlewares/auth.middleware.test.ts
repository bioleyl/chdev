// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware.js';
import { createMockReq, createMockRes } from '../test-utils.js';
import type { Response } from 'express';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe('Middleware - Auth', () => {
  let mockRes: ReturnType<typeof createMockRes>;
  let res: Response;
  let next: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = createMockRes();
    res = mockRes.res as unknown as Response;
    next = vi.fn();
  });

  function createMiddleware() {
    return {
      req: createMockReq(),
      res,
      next,
      jsonCalls: mockRes.getJsonCalls(),
    };
  }

  describe('authMiddleware', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const middleware = createMiddleware();

      await authMiddleware(middleware.req as any, middleware.res as any, middleware.next);

      expect(middleware.next).not.toHaveBeenCalled();
      expect(mockRes.getStatusCalls()).toContain(401);
      expect(middleware.jsonCalls).toEqual([{ status: 401, body: { error: 'Authentication required' } }]);
    });

    it('should return 401 when Authorization header does not start with Bearer', async () => {
      const middleware = createMiddleware();
      middleware.req.headers = { authorization: 'Basic dXNlcjpwYXNz' };

      await authMiddleware(middleware.req as any, middleware.res as any, middleware.next);

      expect(middleware.next).not.toHaveBeenCalled();
      expect(mockRes.getStatusCalls()).toContain(401);
      expect(middleware.jsonCalls).toEqual([{ status: 401, body: { error: 'Authentication required' } }]);
    });

    it('should return 401 when JWT token is invalid', async () => {
      const middleware = createMiddleware();
      middleware.req.headers = { authorization: 'Bearer invalid-token' };

      const jwt = await import('jsonwebtoken');
      vi.mocked(jwt.default.verify).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authMiddleware(middleware.req as any, middleware.res as any, middleware.next);

      expect(middleware.next).not.toHaveBeenCalled();
      expect(mockRes.getStatusCalls()).toContain(401);
      expect(middleware.jsonCalls).toEqual([{ status: 401, body: { error: 'Invalid or expired token' } }]);
    });

    it('should attach user payload and call next when JWT is valid', async () => {
      const middleware = createMiddleware();
      middleware.req.headers = { authorization: 'Bearer valid-token' };

      const jwt = await import('jsonwebtoken');
      vi.mocked(jwt.default.verify).mockReturnValue({
        id: 1,
        email: 'test@example.com',
        role: 'ADMIN',
      });

      await authMiddleware(middleware.req as any, middleware.res as any, middleware.next);

      expect(middleware.next).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    function createRequireRoleMiddleware(roles: Array<string>) {
      const middlewareFn = requireRole(...(roles as any));
      return (r: any, _res: any, n: any) => middlewareFn(r, _res, n);
    }

    it('should return 401 when user is not attached', async () => {
      const middleware = createMiddleware();
      const fn = createRequireRoleMiddleware(['ADMIN']);

      await fn(middleware.req as any, middleware.res as any, middleware.next);

      expect(mockRes.getStatusCalls()).toContain(401);
      expect(middleware.jsonCalls).toEqual([{ status: 401, body: { error: 'Authentication required' } }]);
    });

    it('should return 403 when user role is not in allowed roles', async () => {
      const middleware = createMiddleware();
      (middleware.req as any).user = { id: 1, email: 'test@example.com', role: 'VIEWER' };
      const fn = createRequireRoleMiddleware(['ADMIN', 'EDITOR']);

      await fn(middleware.req as any, middleware.res as any, middleware.next);

      expect(middleware.next).not.toHaveBeenCalled();
      expect(mockRes.getStatusCalls()).toContain(403);
      expect(middleware.jsonCalls).toEqual([{ status: 403, body: { error: 'Insufficient permissions' } }]);
    });

    it('should call next when user role is allowed', async () => {
      const middleware = createMiddleware();
      (middleware.req as any).user = { id: 1, email: 'test@example.com', role: 'ADMIN' };
      const fn = createRequireRoleMiddleware(['ADMIN', 'EDITOR']);

      await fn(middleware.req as any, middleware.res as any, middleware.next);

      expect(middleware.next).toHaveBeenCalled();
    });

    it('should call next when user role matches any of multiple allowed roles', async () => {
      const middleware = createMiddleware();
      (middleware.req as any).user = { id: 1, email: 'test@example.com', role: 'EDITOR' };
      const fn = createRequireRoleMiddleware(['ADMIN', 'EDITOR', 'VIEWER']);

      await fn(middleware.req as any, middleware.res as any, middleware.next);

      expect(middleware.next).toHaveBeenCalled();
    });

    it('should return 403 for VIEWER when only ADMIN is allowed', async () => {
      const middleware = createMiddleware();
      (middleware.req as any).user = { id: 1, email: 'test@example.com', role: 'VIEWER' };
      const fn = createRequireRoleMiddleware(['ADMIN']);

      await fn(middleware.req as any, middleware.res as any, middleware.next);

      expect(mockRes.getStatusCalls()).toContain(403);
      expect(middleware.jsonCalls).toEqual([{ status: 403, body: { error: 'Insufficient permissions' } }]);
    });
  });
});
