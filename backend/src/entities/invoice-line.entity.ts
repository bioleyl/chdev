import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InvoiceEntity } from './invoice.entity.js';
import { PrestationEntity } from './prestation.entity.js';

@Entity()
export class InvoiceLineEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => InvoiceEntity,
    (invoice) => invoice.lines,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'invoiceId' })
  invoice!: InvoiceEntity;

  @Column({ type: 'integer' })
  invoiceId!: number;

  @ManyToOne(
    () => PrestationEntity,
    (prestation) => prestation.invoiceLines
  )
  @JoinColumn({ name: 'prestationId' })
  prestation!: PrestationEntity;

  @Column({ type: 'integer' })
  prestationId!: number;

  @Column({ type: 'real' })
  quantity!: number;

  @Column({ type: 'real' })
  unitPrice!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}

/**
 * Compute the line amount from quantity and unit price.
 */
export function computeLineAmount(line: Pick<InvoiceLineEntity, 'quantity' | 'unitPrice'>): number {
  return line.quantity * line.unitPrice;
}
