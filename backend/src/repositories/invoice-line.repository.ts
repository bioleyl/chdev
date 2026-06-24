import { BaseRepository } from '../common/base-repository.js';
import { InvoiceLineEntity } from '../entities/invoice-line.entity.js';
import type { CreateInvoiceLineInput } from '@chdev/common';
import type { DeleteResult } from 'typeorm';

export class InvoiceLineRepository extends BaseRepository {
  async findAll() {
    return this.transaction.find(InvoiceLineEntity, { relations: ['invoice', 'prestation'] });
  }

  async findById(id: number) {
    return this.transaction.findOne(InvoiceLineEntity, { where: { id }, relations: ['invoice', 'prestation'] });
  }

  async findByInvoiceId(invoiceId: number) {
    return this.transaction.find(InvoiceLineEntity, { where: { invoiceId }, relations: ['prestation'] });
  }

  async findByInvoiceIdPaginated(invoiceId: number, { skip, take }: { skip: number; take: number }) {
    return Promise.all([
      this.transaction.find(InvoiceLineEntity, { where: { invoiceId }, skip, take, relations: ['prestation'] }),
      this.transaction.count(InvoiceLineEntity, { where: { invoiceId } }),
    ]);
  }

  async create(data: CreateInvoiceLineInput & { invoiceId: number }) {
    const line = this.transaction.create(InvoiceLineEntity, data);
    return this.transaction.save(line);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.transaction.delete(InvoiceLineEntity, id);
  }

  async deleteByInvoiceId(invoiceId: number): Promise<DeleteResult> {
    return this.transaction.delete(InvoiceLineEntity, { invoiceId });
  }
}
