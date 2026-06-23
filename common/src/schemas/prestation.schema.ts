import { z } from 'zod';

export const createPrestationSchema = z.object({
  label: z.string().min(1, 'Le libellé est requis'),
  description: z.string().optional(),
  unitPrice: z
    .number({
      invalid_type_error: 'Le prix unitaire doit être un nombre',
    })
    .positive('Le prix unitaire doit être positif'),
  unit: z.string().min(1, "L'unité est requise"),
});

export const updatePrestationSchema = createPrestationSchema.partial().extend({
  id: z.number(),
});

export const prestationSchema = createPrestationSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Prestation = z.infer<typeof prestationSchema>;
export type CreatePrestationInput = z.infer<typeof createPrestationSchema>;
export type UpdatePrestationInput = z.infer<typeof updatePrestationSchema>;
