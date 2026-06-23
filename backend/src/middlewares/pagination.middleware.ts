import { paginationSchema } from '@chdev/common';
import { buildOrder } from '../helpers/build-order.helper.js';
import { validateMiddleware } from './validate.middleware.js';
import type { PaginationInput } from '@chdev/common';
import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import type { TypedHandler, TypedRequest } from './validate.middleware.js';

const DEFAULT_PAGE = 1;
const DEFAULT_ITEMS_PER_PAGE = 10;

export interface PaginationOffset {
  skip: number;
  take: number;
}

export interface PaginationSearch {
  search?: string;
}

export interface PaginationSort {
  order?: Record<string, unknown>;
}

export type PaginationQuery = PaginationOffset & PaginationSearch & PaginationSort;

/**
 * Helper to compute TypeORM offset/limit from Vuetify pagination params.
 * Vuetify uses 1-based `page`; TypeORM uses 0-based `skip`.
 * Applies defaults when values are missing.
 */
export function toOffsetLimit({ page, itemsPerPage }: PaginationInput): PaginationOffset {
  if (itemsPerPage === -1) {
    return { skip: 0, take: Number.MAX_SAFE_INTEGER };
  }
  const p = page ?? DEFAULT_PAGE;
  const n = itemsPerPage ?? DEFAULT_ITEMS_PER_PAGE;
  return {
    skip: (p - 1) * n,
    take: n,
  };
}

export type PaginatedRequest<TBody = unknown, TParams = unknown> = TypedRequest<TBody, TParams, PaginationQuery>;

interface PaginationSchemas<TBody, TParams> {
  body?: ZodSchema<TBody>;
  params?: ZodSchema<TParams>;
}

/**
 * Middleware that validates pagination query params along with optional body and params schemas.
 * Internally delegates to {@link validateMiddleware} with `paginationSchema` always applied to `query`.
 *
 * @example
 * ```ts
 * // Pagination only
 * router.get('/paginated', paginationMiddleware({}, controller.getAllPaginated));
 *
 * // Pagination + params
 * router.get('/:invoiceId/lines/paginated',
 *   paginationMiddleware({ params: invoiceIdParamSchema }, controller.getByInvoicePaginated));
 * ```
 */
export const paginationMiddleware = <TBody = unknown, TParams = unknown>(
  schemas: PaginationSchemas<TBody, TParams> = {},
  ...handlers: Array<TypedHandler<TBody, TParams, PaginationQuery>>
): Array<RequestHandler> => {
  const [validationMiddleware] = validateMiddleware<TBody, TParams, PaginationInput>({
    ...schemas,
    query: paginationSchema,
  });

  const transformQueryMiddleware: RequestHandler = (req, _res, next) => {
    const { page, itemsPerPage, search, sortBy, sortDesc } = req.query as unknown as PaginationInput;
    const { skip, take } = toOffsetLimit({ page, itemsPerPage });
    const isDesc = sortDesc === true || sortDesc === 'true';

    const order = buildOrder(sortBy, isDesc ? 'DESC' : 'ASC');

    const transformedQuery: PaginationQuery = {
      skip,
      take,
      search,
      order,
    };

    (req as unknown as TypedRequest<TBody, TParams, PaginationQuery>).query = transformedQuery;
    next();
  };

  return [validationMiddleware, transformQueryMiddleware, ...(handlers as unknown as Array<RequestHandler>)];
};
