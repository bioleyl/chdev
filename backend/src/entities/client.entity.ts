import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { InvoiceEntity } from './invoice.entity.js';

@Entity()
export class ClientEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', nullable: true })
  companyName!: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @Column({ type: 'integer', nullable: true })
  zipCode?: number;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'real', default: 0 })
  totalBilled!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @OneToMany(
    () => InvoiceEntity,
    (invoice) => invoice.client
  )
  invoices!: Array<InvoiceEntity>;
}
