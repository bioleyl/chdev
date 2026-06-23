import { z } from 'zod';

export const ROLE_ENUM = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
} as const;

export type Role = (typeof ROLE_ENUM)[keyof typeof ROLE_ENUM];

export const roleSchema = z.nativeEnum(ROLE_ENUM);
export type RoleInput = z.infer<typeof roleSchema>;
