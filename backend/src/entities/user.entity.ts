import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Role } from '@chdev/common';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'varchar', default: 'VIEWER' })
  role!: Role;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
