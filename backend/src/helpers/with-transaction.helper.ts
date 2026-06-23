import { AppDataSource } from '../db/connection.js';
import type { EntityManager } from 'typeorm';

export async function withTransaction<T>(run: (transaction: EntityManager) => Promise<T>): Promise<T> {
  return AppDataSource.transaction(run);
}
