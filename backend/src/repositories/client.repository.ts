import { BaseRepository } from '../common/base-repository.js';
import { ClientEntity } from '../entities/client.entity.js';
import { buildSearchCondition } from '../helpers/build-search-condition.helper.js';
import type { Client, CreateClientInput } from '@chdev/common';
import type { DeleteResult } from 'typeorm';
import type { PaginationQuery } from '../middlewares/pagination.middleware.js';

export class ClientRepository extends BaseRepository {
  async findAll() {
    return this.transaction.find(ClientEntity);
  }

  async findAllPaginated({ skip, take, search, order }: PaginationQuery) {
    const { where, relations } = buildSearchCondition(search, ClientEntity, [
      'companyName',
      'email',
      'phone',
      'city',
    ]);

    return Promise.all([
      this.transaction.find(ClientEntity, { where, skip, take, relations, order }),
      this.transaction.count(ClientEntity, { where }),
    ]);
  }

  async findById(id: number) {
    return this.transaction.findOne(ClientEntity, { where: { id }, relations: ['invoices'] });
  }

  async create(data: CreateClientInput): Promise<ClientEntity> {
    const client = this.transaction.create(ClientEntity, data);
    return this.transaction.save(client);
  }

  async update(id: number, data: Partial<Client>): Promise<ClientEntity> {
    await this.transaction.update(ClientEntity, id, data);
    return this.findById(id) as Promise<ClientEntity>;
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.transaction.delete(ClientEntity, id);
  }

  async findInvoicesByClientId(id: number) {
    const client = await this.transaction.findOne(ClientEntity, {
      where: { id },
      relations: ['invoices', 'invoices.lines', 'invoices.client'],
    });
    return client?.invoices || null;
  }
}
