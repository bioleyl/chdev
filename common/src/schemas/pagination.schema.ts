import { z } from 'zod';

/**
 * Pagination query parameters compatible with Vuetify v-data-table.
 * Vuetify uses 1-based page numbers and itemsPerPage.
 * Defaults are applied by `toOffsetLimit()` when values are missing.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  itemsPerPage: z.coerce.number().int().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDesc: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
  totalItems: z.coerce.number().int().nonnegative().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Standard paginated response envelope.
 * `data` contains the items for the current page.
 * `total` is the total number of items across all pages (used by Vuetify for the pager).
 */
export interface PaginatedResponse<T> {
  data: Array<T>;
  total: number;
}
