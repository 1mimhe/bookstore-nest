import { ObjectLiteral, Repository } from 'typeorm';

export type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock;
} & {
  find: jest.Mock;
  findOne: jest.Mock;
  findOneOrFail: jest.Mock;
  findBy: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  decrement: jest.Mock;
  increment: jest.Mock;
  createQueryBuilder: jest.Mock;
};

export const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  findBy: jest.fn(),
  create: jest.fn((dto) => dto),
  save: jest.fn((entity) => Promise.resolve({ id: 'mock-uuid', ...entity })),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  decrement: jest.fn().mockResolvedValue({ affected: 1 }),
  increment: jest.fn().mockResolvedValue({ affected: 1 }),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  })),
});
