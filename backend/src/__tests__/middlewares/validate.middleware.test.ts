// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validateMiddleware } from '../../middlewares/validate.middleware.js';
import type { Request, Response } from 'express';

describe('Middleware - Validate', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: any;
  let jsonCalls: Array<{ status?: number; body?: unknown }>;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonCalls = [];

    req = {
      params: {},
      query: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockImplementation((body) => {
        jsonCalls.push({ body });
      }),
    } as unknown as Response;
    next = vi.fn();
  });

  function createMiddleware() {
    return {
      req,
      res,
      next,
      jsonCalls,
    };
  }

  it('should call next when all schemas validate successfully', async () => {
    const middleware = createMiddleware();
    const schema = z.object({ id: z.number() });
    const handler = vi.fn();
    const [validationMiddleware, ..._handlers] = validateMiddleware({ params: schema }, handler);

    middleware.req.params = { id: 1 };
    await validationMiddleware(middleware.req as any, middleware.res as any, middleware.next);

    expect(middleware.next).toHaveBeenCalled();
  });

  it('should parse and assign params when params schema is valid', async () => {
    const middleware = createMiddleware();
    const schema = z.object({ id: z.coerce.number() });
    const handler = vi.fn();
    const [validationMiddleware] = validateMiddleware({ params: schema }, handler);

    middleware.req.params = { id: '1' };
    await validationMiddleware(middleware.req as any, middleware.res as any, middleware.next);

    expect(middleware.next).toHaveBeenCalled();
    expect((middleware.req as any).params).toEqual({ id: 1 });
  });

  it('should parse and assign body when body schema is valid', async () => {
    const middleware = createMiddleware();
    const schema = z.object({ name: z.string() });
    const handler = vi.fn();
    const [validationMiddleware] = validateMiddleware({ body: schema }, handler);

    middleware.req.body = { name: 'Test' };
    await validationMiddleware(middleware.req as any, middleware.res as any, middleware.next);

    expect(middleware.next).toHaveBeenCalled();
    expect((middleware.req as any).body).toEqual({ name: 'Test' });
  });

  it('should return 422 when params validation fails', async () => {
    const middleware = createMiddleware();
    const schema = z.object({ id: z.coerce.number() });
    const handler = vi.fn();
    const [validationMiddleware] = validateMiddleware({ params: schema }, handler);

    middleware.req.params = { id: 'not-a-number' };
    await validationMiddleware(middleware.req as any, middleware.res as any, middleware.next);

    expect(middleware.next).not.toHaveBeenCalled();
    expect((middleware.res as any).status).toHaveBeenCalledWith(422);
  });

  it('should return 422 with error details when body validation fails', async () => {
    const middleware = createMiddleware();
    const schema = z.object({ name: z.string().min(1) });
    const handler = vi.fn();
    const [validationMiddleware] = validateMiddleware({ body: schema }, handler);

    middleware.req.body = { name: '' };
    await validationMiddleware(middleware.req as any, middleware.res as any, middleware.next);

    expect(middleware.next).not.toHaveBeenCalled();
    expect((middleware.res as any).status).toHaveBeenCalledWith(422);
    const errorBody = middleware.jsonCalls[0]?.body as { errors: Array<{ path: string; message: string }> };
    expect(errorBody).toHaveProperty('errors');
  });

  it('should return 422 when query validation fails', async () => {
    const middleware = createMiddleware();
    const schema = z.object({ page: z.coerce.number().min(1) });
    const handler = vi.fn();
    const [validationMiddleware] = validateMiddleware({ query: schema }, handler);

    middleware.req.query = { page: '0' };
    await validationMiddleware(middleware.req as any, middleware.res as any, middleware.next);

    expect(middleware.next).not.toHaveBeenCalled();
    expect((middleware.res as any).status).toHaveBeenCalledWith(422);
  });

  it('should parse and assign all three when all schemas are valid', async () => {
    const middleware = createMiddleware();
    const paramsSchema = z.object({ id: z.coerce.number() });
    const querySchema = z.object({ page: z.coerce.number().optional() });
    const bodySchema = z.object({ name: z.string() });
    const handler = vi.fn();
    const [validationMiddleware] = validateMiddleware(
      { params: paramsSchema, query: querySchema, body: bodySchema },
      handler
    );

    middleware.req.params = { id: '1' };
    middleware.req.query = { page: '1' };
    middleware.req.body = { name: 'Test' };
    await validationMiddleware(middleware.req as any, middleware.res as any, middleware.next);

    expect(middleware.next).toHaveBeenCalled();
    expect((middleware.req as any).params).toEqual({ id: 1 });
    expect((middleware.req as any).query).toEqual({ page: 1 });
    expect((middleware.req as any).body).toEqual({ name: 'Test' });
  });

  it('should forward non-ZodError to next(err)', async () => {
    const middleware = createMiddleware();
    const schema = z.object({ id: z.coerce.number() });
    const handler = vi.fn();
    const [validationMiddleware] = validateMiddleware({ params: schema }, handler);

    middleware.req.params = { id: 'not-a-number' };
    await validationMiddleware(middleware.req as any, middleware.res as any, middleware.next);

    expect((middleware.res as any).status).toHaveBeenCalledWith(422);
  });

  it('should return error with path and message for each validation error', async () => {
    const middleware = createMiddleware();
    const schema = z.object({ email: z.string().email(), age: z.number().min(18) });
    const handler = vi.fn();
    const [validationMiddleware] = validateMiddleware({ body: schema }, handler);

    middleware.req.body = { email: 'not-an-email', age: 10 };
    await validationMiddleware(middleware.req as any, middleware.res as any, middleware.next);

    expect((middleware.res as any).status).toHaveBeenCalledWith(422);
    const errorBody = middleware.jsonCalls[0]?.body as { errors: Array<{ path: string; message: string }> };
    expect(errorBody).toHaveProperty('errors');
    expect(Array.isArray(errorBody.errors)).toBe(true);
    expect(errorBody.errors[0]).toHaveProperty('path');
    expect(errorBody.errors[0]).toHaveProperty('message');
  });

  it('should return array with middleware and handlers', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const result = validateMiddleware({}, handler1, handler2);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3); // middleware + handler1 + handler2
  });
});
