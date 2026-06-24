import { AppDataSource } from '../db/connection.js';
import type { EntityManager } from 'typeorm';

export abstract class BaseRepository {
  protected readonly transaction: EntityManager;

  constructor(transaction: EntityManager) {
    this.transaction = transaction;
  }

  static create<T extends BaseRepository>(
    this: new (
      transaction: EntityManager
    ) => T,
    transaction?: EntityManager
  ): T {
    return new this(transaction ?? AppDataSource.manager);
  }
}
