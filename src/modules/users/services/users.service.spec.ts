import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Address } from '../entities/address.entity';
import { Bookmark } from '../../books/entities/bookmark.entity';
import { Order } from '../../orders/entities/order.entity';
import { DataSource } from 'typeorm';
import { AuthService } from '../../auth/auth.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: ReturnType<typeof createMockRepository>;
  let addressRepo: ReturnType<typeof createMockRepository>;
  let bookmarkRepo: ReturnType<typeof createMockRepository>;
  let orderRepo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    userRepo = createMockRepository();
    addressRepo = createMockRepository();
    bookmarkRepo = createMockRepository();
    orderRepo = createMockRepository();
    dataSource = createMockDataSource();
    authService = {
      hashPassword: jest.fn().mockResolvedValue('hashed_password'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Address), useValue: addressRepo },
        { provide: getRepositoryToken(Bookmark), useValue: bookmarkRepo },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find user with relations', async () => {
      const mockUser = { id: 'u1', username: 'john' };
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('u1');
      expect(result).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'u1' },
        relations: { contact: true, roles: true },
      });
    });
  });

  describe('checkUniqueConstraints', () => {
    it('should return empty conflicts array when no matching user found', async () => {
      userRepo.find.mockResolvedValue([]);
      const conflicts = await service.checkUniqueConstraints('newuser', '09123456789', 'new@test.com');
      expect(conflicts).toEqual([]);
    });

    it('should return conflict when username exists', async () => {
      userRepo.find.mockResolvedValue([{ id: 'u1', username: 'existinguser' }]);
      const conflicts = await service.checkUniqueConstraints('existinguser');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].field).toBe('username');
    });
  });

  describe('createAddress', () => {
    it('should save new address entity', async () => {
      const dto = { title: 'Home', postalCode: '1234567890', address: 'Tehran' };
      const saved = { id: 'addr-1', userId: 'u1', ...dto };
      addressRepo.create.mockReturnValue(saved);
      addressRepo.save.mockResolvedValue(saved);

      const result = await service.createAddress('u1', dto as any);
      expect(result).toEqual(saved);
      expect(addressRepo.save).toHaveBeenCalled();
    });
  });

  describe('getAllUserAddresses', () => {
    it('should return active addresses for user', async () => {
      const addresses = [{ id: 'a1', isActive: true }];
      addressRepo.find.mockResolvedValue(addresses);

      const result = await service.getAllUserAddresses('u1');
      expect(result).toEqual(addresses);
      expect(addressRepo.find).toHaveBeenCalledWith({
        where: { userId: 'u1', isActive: true },
      });
    });
  });
});
