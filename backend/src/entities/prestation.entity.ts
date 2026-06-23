import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { InvoiceLineEntity } from './invoice-line.entity.js';

@Entity()
export class PrestationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  label!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'real' })
  unitPrice!: number;

  @Column({ type: 'varchar', default: 'U' })
  unit!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @OneToMany(
    () => InvoiceLineEntity,
    (invoiceLine) => invoiceLine.prestation
  )
  invoiceLines!: Array<InvoiceLineEntity>;
}
