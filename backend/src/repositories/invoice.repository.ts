import { BaseRepository } from '../common/base-repository.js';
import { InvoiceEntity } from '../entities/invoice.entity.js';
import { InvoiceLineEntity } from '../entities/invoice-line.entity.js';
import { buildSearchCondition } from '../helpers/build-search-condition.helper.js';
import type { CreateInvoiceInput, UpdateInvoiceInput } from '@chdev/common';
import type { DeleteResult } from 'typeorm';
import type { PaginationQuery } from '../middlewares/pagination.middleware.js';

export class InvoiceRepository extends BaseRepository {
  async findAll() {
    return this.transaction.find(InvoiceEntity, { relations: ['lines', 'client'] });
  }

  async findAllPaginated({ skip, take, search, order }: PaginationQuery) {
    const { where, relations } = buildSearchCondition(
      search,
      InvoiceEntity,
      ['number', 'status'],
      [
        { entity: 'client', columns: ['companyName', 'email', 'city'] },
        { entity: 'lines', columns: [] }, // load without searching
      ]
    );

    return Promise.all([
      this.transaction.find(InvoiceEntity, {
        where,
        skip,
        take,
        relations,
        order,
      }),
      this.transaction.count(InvoiceEntity, { where }),
    ]);
  }

  async findById(id: number) {
    return this.transaction.findOne(InvoiceEntity, {
      where: { id },
      relations: ['lines', 'client', 'lines.prestation'],
    });
  }

  async findByNumber(number: string) {
    return this.transaction.findOne(InvoiceEntity, { where: { number }, relations: ['lines', 'client'] });
  }

  async findByClientId(clientId: number) {
    return this.transaction.find(InvoiceEntity, { where: { clientId }, relations: ['lines', 'client'] });
  }

  async findByClientIdPaginated(clientId: number, { skip, take, order }: PaginationQuery) {
    return Promise.all([
      this.transaction.find(InvoiceEntity, {
        where: { clientId },
        skip,
        take,
        relations: ['lines', 'client'],
        order,
      }),
      this.transaction.count(InvoiceEntity, { where: { clientId } }),
    ]);
  }

  async create(data: CreateInvoiceInput) {
    const total = data.lines?.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) || 0;
    const invoice = this.transaction.create(InvoiceEntity, {
      ...data,
      status: 'DRAFT',
      total,
      number: await this.getNextInvoiceNumber(),
    });
    return this.transaction.save(invoice);
  }

  async update(data: UpdateInvoiceInput) {
    const total = await this.recalculateTotal(data.id);
    return this.transaction.save(InvoiceEntity, { ...data, total });
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.transaction.delete(InvoiceEntity, id);
  }

  /**
   * Recalculate the total from invoice lines.
   */
  async recalculateTotal(id: number): Promise<number> {
    const qb = this.transaction
      .createQueryBuilder(InvoiceLineEntity, 'il')
      .select('SUM(il.quantity * il.unitPrice)', 'total')
      .where('il.invoiceId = :id', { id });

    const result = await qb.getRawOne();
    const total = parseFloat(result?.total) || 0;

    await this.transaction.update(InvoiceEntity, id, { total });
    return total;
  }

  /**
   * Calculate the next invoice number based on the last invoice number in the database and the year.
   * Uses '-' as separator (not '/') to be Windows-filename-safe.
   */
  async getNextInvoiceNumber(): Promise<string> {
    const yearStart = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0);
    const yearEnd = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    const lastInvoice = await this.transaction
      .createQueryBuilder(InvoiceEntity, 'invoice')
      .where('invoice.createdAt BETWEEN :start AND :end', { start: yearStart, end: yearEnd })
      .orderBy('invoice.number', 'DESC')
      .getOne();

    const separator = '-';
    const nextNumber = lastInvoice ? parseInt(lastInvoice.number.split(separator)[1], 10) + 1 : 1;

    return `${new Date().getFullYear()}${separator}${nextNumber.toString().padStart(4, '0')}`;
  }
}
