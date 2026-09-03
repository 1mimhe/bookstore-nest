import { createMockRepository } from './repository.mock';

export const createMockDataSource = () => {
  const innerRepo = createMockRepository();
  const mockManager: any = {
    save: jest.fn((_, entity) => Promise.resolve(entity ? { id: 'mock-tx-id', ...entity } : { id: 'mock-tx-id' })),
    create: jest.fn((_, entity) => entity),
    findOne: jest.fn().mockResolvedValue({ id: 'mock-tx-id' }),
    findOneOrFail: jest.fn().mockResolvedValue({ id: 'mock-tx-id' }),
    findBy: jest.fn().mockResolvedValue([]),
    decrement: jest.fn().mockResolvedValue({ affected: 1 }),
    increment: jest.fn().mockResolvedValue({ affected: 1 }),
    remove: jest.fn((_, entity) => Promise.resolve(entity)),
    softRemove: jest.fn((_, entity) => Promise.resolve(entity)),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    getRepository: jest.fn(() => innerRepo),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 'mock-tx-id' }),
      getRawOne: jest.fn().mockResolvedValue(null),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    })),
  };

  return {
    manager: mockManager,
    transaction: jest.fn(async (cb) => cb(mockManager)),
    getRepository: jest.fn(() => createMockRepository()),
  };
};
