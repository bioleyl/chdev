import { z } from 'zod';
import { prestationSchema } from './prestation.schema.js';

export const invoiceIdParamSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
});

export const invoiceLineParamSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
  id: z.coerce.number().int().positive(),
});

export const createInvoiceLineSchema = z.object({
  prestationId: z.number().int().positive(),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  description: z.string().optional(),
});

export const updateInvoiceLineSchema = createInvoiceLineSchema.partial().extend({
  id: z.number().int().positive(),
});

export const invoiceLineSchema = createInvoiceLineSchema.extend({
  id: z.number().int().positive(),
  prestation: prestationSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InvoiceLine = z.infer<typeof invoiceLineSchema>;
export type CreateInvoiceLineInput = z.infer<typeof createInvoiceLineSchema>;
export type UpdateInvoiceLineInput = z.infer<typeof updateInvoiceLineSchema>;
export type InvoiceIdParamInput = z.infer<typeof invoiceIdParamSchema>;
export type InvoiceLineParamInput = z.infer<typeof invoiceLineParamSchema>;
