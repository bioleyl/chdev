import { z } from 'zod';

// Pour les routes avec /:id
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type IdParamInput = z.infer<typeof idParamSchema>;
