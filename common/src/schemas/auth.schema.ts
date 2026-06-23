import { z } from 'zod';
import { roleSchema } from './role.schema.js';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const jwtPayloadSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: roleSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
export type LoginResponse = {
  token: string;
  user: JwtPayload;
};
