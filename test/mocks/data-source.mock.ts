export const createMockDataSource = () => ({
  transaction: jest.fn(async (cb) => {
    const mockManager = {
      save: jest.fn((_, entity) => Promise.resolve({ id: 'mock-tx-id', ...entity })),
      create: jest.fn((_, entity) => entity),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      findBy: jest.fn().mockResolvedValue([]),
      decrement: jest.fn().mockResolvedValue({ affected: 1 }),
      increment: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      })),
    };
    return cb(mockManager);
  }),
  getRepository: jest.fn(() => ({
    increment: jest.fn().mockResolvedValue({ affected: 1 }),
    decrement: jest.fn().mockResolvedValue({ affected: 1 }),
  })),
});
