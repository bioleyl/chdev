// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { describe, expect, it, vi } from 'vitest';
import { buildOrder } from '../../helpers/build-order.helper.js';
import { paginationMiddleware, toOffsetLimit } from '../../middlewares/pagination.middleware.js';
import type { RequestHandler } from 'express';

vi.mock('../../helpers/build-order.helper.js', () => ({
  buildOrder: vi.fn(),
}));

vi.mock('../../middlewares/validate.middleware.js', () => ({
  validateMiddleware: vi.fn().mockReturnValue([vi.fn()]),
}));

describe('Middleware - Pagination', () => {
  describe('toOffsetLimit', () => {
    it('should convert Vuetify page 1 and itemsPerPage 10 to skip 0 and take 10', () => {
      const result = toOffsetLimit({ page: 1, itemsPerPage: 10 });
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('should convert Vuetify page 2 and itemsPerPage 10 to skip 10 and take 10', () => {
      const result = toOffsetLimit({ page: 2, itemsPerPage: 10 });
      expect(result).toEqual({ skip: 10, take: 10 });
    });

    it('should convert Vuetify page 3 and itemsPerPage 5 to skip 10 and take 5', () => {
      const result = toOffsetLimit({ page: 3, itemsPerPage: 5 });
      expect(result).toEqual({ skip: 10, take: 5 });
    });

    it('should return MAX_SAFE_INTEGER take when itemsPerPage is -1', () => {
      const result = toOffsetLimit({ page: 1, itemsPerPage: -1 });
      expect(result.take).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.skip).toBe(0);
    });

    it('should default page to 1 when not provided', () => {
      const result = toOffsetLimit({ itemsPerPage: 10 });
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('should default itemsPerPage to 10 when not provided', () => {
      const result = toOffsetLimit({ page: 1 });
      expect(result).toEqual({ skip: 0, take: 10 });
    });
  });

  describe('paginationMiddleware', () => {
    it('should return an array of middleware and handlers', async () => {
      const handler = vi.fn();
      const middleware = paginationMiddleware({}, handler);

      expect(Array.isArray(middleware)).toBe(true);
      expect(middleware.length).toBe(3); // validate + transformQuery + handler
    });

    it('should transform Vuetify pagination params to skip/take', async () => {
      const handler = vi.fn();
      vi.mocked(buildOrder).mockReturnValue({});

      const middleware = paginationMiddleware({}, handler);

      // Call the transform middleware (index 1) with Vuetify-style query params
      const transformMiddleware = middleware[1] as RequestHandler;
      const nextSpy = vi.fn();
      transformMiddleware({ query: { page: 2, itemsPerPage: 10 } } as any, {} as any, nextSpy);

      expect(nextSpy).toHaveBeenCalled();
    });

    it('should build order from sortBy and sortDesc', async () => {
      const handler = vi.fn();
      vi.mocked(buildOrder).mockReturnValue({ createdAt: 'DESC' });

      const middleware = paginationMiddleware({}, handler);

      // Call the transform middleware (index 1) with sortBy and sortDesc
      const transformMiddleware = middleware[1] as RequestHandler;
      const nextSpy = vi.fn();
      transformMiddleware({ query: { sortBy: 'createdAt', sortDesc: true } } as any, {} as any, nextSpy);

      expect(buildOrder).toHaveBeenCalled();
    });

    it('should apply ASC order when sortDesc is false', async () => {
      const handler = vi.fn();
      vi.mocked(buildOrder).mockReturnValue({ label: 'ASC' });

      const middleware = paginationMiddleware({}, handler);

      // Call the transform middleware (index 1) with sortBy and sortDesc=false
      const transformMiddleware = middleware[1] as RequestHandler;
      const nextSpy = vi.fn();
      transformMiddleware({ query: { sortBy: 'label', sortDesc: false } } as any, {} as any, nextSpy);

      expect(buildOrder).toHaveBeenCalledWith('label', 'ASC');
    });

    it('should apply DESC order when sortDesc is true', async () => {
      const handler = vi.fn();
      vi.mocked(buildOrder).mockReturnValue({ label: 'DESC' });

      const middleware = paginationMiddleware({}, handler);

      // Call the transform middleware (index 1) with sortBy and sortDesc=true
      const transformMiddleware = middleware[1] as RequestHandler;
      const nextSpy = vi.fn();
      transformMiddleware({ query: { sortBy: 'label', sortDesc: true } } as any, {} as any, nextSpy);

      expect(buildOrder).toHaveBeenCalledWith('label', 'DESC');
    });
  });
});
