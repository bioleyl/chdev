import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';
import { EnvHelper } from '../helpers/env.helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Resolve the database path using platform-agnostic resolution.
 * On Windows, this avoids issues with forward-slash vs backslash paths.
 */
const defaultDbPath = EnvHelper.resolveProjectPath('data/chdev.db');
console.log(`Using database path: ${defaultDbPath}`);

/**
 * Resolve entity/migration glob patterns using platform-agnostic separators.
 * TypeORM's glob patterns need forward slashes even on Windows.
 */
function toTypeOrmPattern(relativePath: string): string {
  // TypeORM expects forward-slash glob patterns regardless of OS
  return relativePath.replace(/\\/g, '/');
}

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: EnvHelper.getVariable('DB_PATH', defaultDbPath),
  synchronize: false,
  logging: EnvHelper.getVariable('NODE_ENV') !== 'production',
  entities: [toTypeOrmPattern(resolve(__dirname, '../entities/**/*.ts'))],
  migrations: [toTypeOrmPattern(resolve(__dirname, '../migrations/*.ts'))],
});

export async function initializeDatabase() {
  await AppDataSource.initialize();
  console.log('Database connected');
}
