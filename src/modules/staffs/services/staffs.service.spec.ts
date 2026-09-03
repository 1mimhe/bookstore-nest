import { Test, TestingModule } from '@nestjs/testing';
import { StaffsService } from './staffs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from '../entities/staff.entity';
import { StaffAction, StaffActionTypes, EntityTypes } from '../entities/staff-action.entity';
import { DataSource } from 'typeorm';
import { AuthService } from '../../auth/auth.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';

describe('StaffsService', () => {
  let service: StaffsService;
  let staffRepo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    staffRepo = createMockRepository();
    dataSource = createMockDataSource();
    authService = {
      signup: jest.fn().mockImplementation(async (dto, roles, cb) => {
        const mockUser = { id: 'u1' };
        const mockManager = {
          create: jest.fn().mockReturnValue({ id: 's1', ...dto }),
          save: jest.fn().mockResolvedValue({ id: 's1', ...dto }),
        };
        return cb(mockUser, mockManager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffsService,
        { provide: getRepositoryToken(Staff), useValue: staffRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    service = module.get<StaffsService>(StaffsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAction', () => {
    it('should create and save staff action using transaction manager', async () => {
      const mockManager = {
        create: jest.fn().mockReturnValue({ id: 'act-1' }),
        save: jest.fn().mockResolvedValue({ id: 'act-1' }),
      };

      const result = await service.createAction(
        {
          userId: 'u1',
          type: StaffActionTypes.BookCreated,
          entityId: 'book-1',
          entityType: EntityTypes.Book,
        },
        mockManager as any,
      );

      expect(mockManager.create).toHaveBeenCalledWith(StaffAction, expect.any(Object));
      expect(mockManager.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'act-1');
    });
  });

  describe('deleteReview', () => {
    it('should record review deletion action and softDelete review', async () => {
      dataSource.manager.create.mockReturnValue({ id: 'act-1' });
      dataSource.manager.save.mockResolvedValue({ id: 'act-1' });
      dataSource.manager.getRepository().softDelete.mockResolvedValue({ affected: 1 });

      await service.deleteReview('rev-1', 'u1', 'staff-1');
      expect(dataSource.manager.getRepository().softDelete).toHaveBeenCalledWith({ id: 'rev-1' });
    });
  });
});
