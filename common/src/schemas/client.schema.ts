import { z } from 'zod';

export const createClientSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.number().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.number(),
});

export const clientSchema = createClientSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  totalBilled: z.number(),
});

export type Client = z.infer<typeof clientSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
