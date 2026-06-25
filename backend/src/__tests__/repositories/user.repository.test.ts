// biome-ignore-all lint/suspicious/noExplicitAny: test mocks don't match Express types
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserEntity } from '../../entities/user.entity.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { createMockManager } from '../test-utils.js';

describe('Repository - User', () => {
  let mockM: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockM = createMockManager();
  });

  function createRepo() {
    return new UserRepository(mockM as any);
  }

  it('should call transaction.find for findAll', async () => {
    const mockUser = { id: 1, email: 'test@example.com' } as UserEntity;
    mockM.find.mockResolvedValue([mockUser]);

    const repo = createRepo();
    const result = await repo.findAll();

    expect(mockM.find).toHaveBeenCalledWith(UserEntity);
    expect(result).toEqual([mockUser]);
  });

  it('should call findOneBy for findById', async () => {
    const mockUser = { id: 1, email: 'test@example.com' } as UserEntity;
    mockM.findOneBy.mockResolvedValue(mockUser);

    const repo = createRepo();
    const result = await repo.findById(1);

    expect(mockM.findOneBy).toHaveBeenCalledWith(UserEntity, { id: 1 });
    expect(result).toEqual(mockUser);
  });

  it('should call findOneBy for findByEmail', async () => {
    const mockUser = { id: 1, email: 'test@example.com' } as UserEntity;
    mockM.findOneBy.mockResolvedValue(mockUser);

    const repo = createRepo();
    const result = await repo.findByEmail('test@example.com');

    expect(mockM.findOneBy).toHaveBeenCalledWith(UserEntity, { email: 'test@example.com' });
    expect(result).toEqual(mockUser);
  });

  it('should return null when findByEmail finds nothing', async () => {
    mockM.findOneBy.mockResolvedValue(null);

    const repo = createRepo();
    const result = await repo.findByEmail('nonexistent@example.com');

    expect(mockM.findOneBy).toHaveBeenCalledWith(UserEntity, { email: 'nonexistent@example.com' });
    expect(result).toBeNull();
  });

  it('should create and save for create', async () => {
    const mockUser = { id: 1, email: 'new@example.com', role: 'ADMIN' } as UserEntity;
    mockM.create.mockReturnValue(mockUser);
    mockM.save.mockResolvedValue(mockUser);

    const repo = createRepo();
    const result = await repo.create({ email: 'new@example.com', password: 'hashed', role: 'ADMIN' });

    expect(mockM.create).toHaveBeenCalledWith(UserEntity, {
      email: 'new@example.com',
      password: 'hashed',
      role: 'ADMIN',
    });
    expect(mockM.save).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual(mockUser);
  });

  it('should create without role for create', async () => {
    const mockUser = { id: 1, email: 'new@example.com' } as UserEntity;
    mockM.create.mockReturnValue(mockUser);
    mockM.save.mockResolvedValue(mockUser);

    const repo = createRepo();
    await repo.create({ email: 'new@example.com', password: 'hashed' });

    expect(mockM.create).toHaveBeenCalledWith(UserEntity, {
      email: 'new@example.com',
      password: 'hashed',
    });
  });

  it('should save updated data for update', async () => {
    const mockUser = { id: 1, email: 'updated@example.com' } as UserEntity;
    mockM.save.mockResolvedValue(mockUser);

    const repo = createRepo();
    const result = await repo.update(1, { email: 'updated@example.com' });

    expect(mockM.save).toHaveBeenCalledWith(UserEntity, { id: 1, email: 'updated@example.com' });
    expect(result).toEqual(mockUser);
  });

  it('should call transaction.delete for delete', async () => {
    const mockDeleteResult = { affected: 1 } as any;
    mockM.delete.mockResolvedValue(mockDeleteResult);

    const repo = createRepo();
    const result = await repo.delete(1);

    expect(mockM.delete).toHaveBeenCalledWith(UserEntity, 1);
    expect(result).toEqual(mockDeleteResult);
  });
});
