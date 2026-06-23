/**
 * Seed users — one user per role (ADMIN, EDITOR, VIEWER).
 *
 * Configuration: adjust `users` below to change credentials.
 */

import bcrypt from 'bcryptjs';
import { UserEntity } from '../entities/user.entity.js';
import { AppDataSource } from './connection.js';
import type { Role } from '@chdev/common';

// ── Configuration ─────────────────────────────────────────────────────────────

interface UserConfig {
  email: string;
  password: string;
  role: Role;
}

const users: Array<UserConfig> = [
  { email: 'admin@admin.com', password: 'admin', role: 'ADMIN' },
  { email: 'writer@writer.com', password: 'writer', role: 'EDITOR' },
  { email: 'viewer@viewer.com', password: 'viewer', role: 'VIEWER' },
];

// ── Seeder ────────────────────────────────────────────────────────────────────

export async function seedUsers(): Promise<void> {
  const repo = AppDataSource.getRepository(UserEntity);
  let created = 0;

  for (const user of users) {
    const existing = await repo.findOneBy({ email: user.email });
    if (existing) {
      console.log(`  ⊘ Skipped (exists): ${user.email} (${user.role})`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createdUser = await repo.save(
      repo.create({
        email: user.email,
        password: hashedPassword,
        role: user.role as Role,
      })
    );

    console.log(`  ✓ Created: ${createdUser.email} (${createdUser.role})`);
    created++;
  }

  console.log(`  [users] ${created} created, ${users.length - created} already existed`);
}
