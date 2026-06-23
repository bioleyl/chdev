import { BaseRepository } from '../common/base-repository.js';
import { UserEntity } from '../entities/user.entity.js';
import type { Role } from '@chdev/common';
import type { DeleteResult } from 'typeorm';

export class UserRepository extends BaseRepository {
  async findAll() {
    return this.transaction.find(UserEntity);
  }

  async findById(id: number) {
    return this.transaction.findOneBy(UserEntity, { id });
  }

  async findByEmail(email: string) {
    return this.transaction.findOneBy(UserEntity, { email });
  }

  async create(data: { email: string; password: string; role?: Role }) {
    const user = this.transaction.create(UserEntity, data);
    return this.transaction.save(user);
  }

  async update(id: number, data: Partial<UserEntity>) {
    return this.transaction.save(UserEntity, { id, ...data });
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.transaction.delete(UserEntity, id);
  }
}
