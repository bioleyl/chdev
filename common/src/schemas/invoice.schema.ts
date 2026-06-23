import { z } from 'zod';
import { clientSchema } from './client.schema.js';
import { createInvoiceLineSchema, invoiceLineSchema } from './invoice-line.schema.js';

export const InvoiceStatusEnum = z.enum(['DRAFT', 'SENT', 'PAID', 'CANCELLED']);

export const createInvoiceSchema = z.object({
  clientId: z.number(),
  lines: z.array(createInvoiceLineSchema).min(1),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  lines: z.array(createInvoiceLineSchema.or(invoiceLineSchema)).optional(),
  id: z.number(),
});

export const invoiceSchema = createInvoiceSchema.extend({
  id: z.number(),
  number: z.string(),
  status: InvoiceStatusEnum,
  total: z.number(),
  client: clientSchema.optional(),
  lines: z.array(invoiceLineSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Invoice = z.infer<typeof invoiceSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;
