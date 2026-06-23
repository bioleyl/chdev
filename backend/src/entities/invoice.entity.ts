import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClientEntity } from './client.entity.js';
import { InvoiceLineEntity } from './invoice-line.entity.js';
import type { InvoiceStatus } from '@chdev/common';

@Entity()
export class InvoiceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  number!: string;

  @Column({ type: 'integer', nullable: true })
  clientId?: number;

  @ManyToOne(
    () => ClientEntity,
    (client) => client.invoices,
    { onDelete: 'SET NULL' }
  )

  @JoinColumn({ name: 'clientId' })
  client?: ClientEntity;

  @Column({ type: 'varchar', default: 'draft' })
  status!: InvoiceStatus;

  @Column({ type: 'real', default: 0 })
  total!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @OneToMany(
    () => InvoiceLineEntity,
    (invoiceLine) => invoiceLine.invoice
  )
  lines!: Array<InvoiceLineEntity>;
}
