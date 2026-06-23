import { BaseRepository } from '../common/base-repository.js';
import { PrestationEntity } from '../entities/prestation.entity.js';
import { buildSearchCondition } from '../helpers/build-search-condition.helper.js';
import type { CreatePrestationInput } from '@chdev/common';
import type { DeleteResult } from 'typeorm';
import type { PaginationQuery } from '../middlewares/pagination.middleware.js';

export class PrestationRepository extends BaseRepository {
  async findAll() {
    return this.transaction.find(PrestationEntity);
  }

  async findAllPaginated({ skip, take, search, order }: PaginationQuery) {
    const { where, relations } = buildSearchCondition(search, PrestationEntity, ['label', 'description', 'unit']);
    return Promise.all([
      this.transaction.find(PrestationEntity, { where, skip, take, relations, order }),
      this.transaction.count(PrestationEntity, { where }),
    ]);
  }

  async findById(id: number) {
    return this.transaction.findOneBy(PrestationEntity, { id });
  }

  async create(data: CreatePrestationInput) {
    const prestation = this.transaction.create(PrestationEntity, { ...data, unit: data.unit || 'U' });
    return this.transaction.save(prestation);
  }

  async update(id: number, data: Partial<PrestationEntity>) {
    return this.transaction.save(PrestationEntity, { id, ...data });
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.transaction.delete(PrestationEntity, id);
  }
}
