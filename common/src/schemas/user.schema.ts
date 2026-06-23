import { z } from 'zod';
import { roleSchema } from './role.schema.js';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: roleSchema.optional(),
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.number(),
});

export const userSchema = createUserSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
