import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsService } from './collections.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Collection } from '../entities/collection.entity';
import { CollectionBook } from '../entities/collection-book.entity';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { StaffsService } from '../../staffs/staffs.service';
import { ViewsService } from '../../views/views.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CollectionsService', () => {
  let service: CollectionsService;
  let collectionRepo: ReturnType<typeof createMockRepository>;
  let collectionBookRepo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;
  let staffsService: Partial<StaffsService>;
  let viewsService: Partial<ViewsService>;

  beforeEach(async () => {
    collectionRepo = createMockRepository();
    collectionBookRepo = createMockRepository();
    dataSource = createMockDataSource();
    staffsService = {
      createAction: jest.fn().mockResolvedValue({} as any),
    };
    viewsService = {
      getTrendingEntities: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        { provide: getRepositoryToken(Collection), useValue: collectionRepo },
        { provide: getRepositoryToken(CollectionBook), useValue: collectionBookRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: StaffsService, useValue: staffsService },
        { provide: ViewsService, useValue: viewsService },
      ],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save collection and record staff action', async () => {
      const dto = { name: 'Summer Reads', slug: 'summer-reads', isPublic: true };
      const saved = { id: 'col-1', ...dto, userId: 'user-1' };
      dataSource.manager.create.mockReturnValue(saved);
      dataSource.manager.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, 'user-1');
      expect(result).toEqual(saved);
      expect(staffsService.createAction).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return public collection', async () => {
      const col = { id: 'col-1', isPublic: true, userId: 'u2', user: { roles: [] } };
      collectionRepo.findOneOrFail.mockResolvedValue(col);

      const result = await service.get({ id: 'col-1' }, false, undefined, 'u1');
      expect(result.id).toBe('col-1');
    });

    it('should throw NotFoundException if private collection does not belong to user', async () => {
      const col = { id: 'col-1', isPublic: false, userId: 'u2', user: { roles: [] } };
      collectionRepo.findOneOrFail.mockResolvedValue(col);

      await expect(service.get({ id: 'col-1' }, false, undefined, 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if neither id nor slug provided', async () => {
      await expect(service.get({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should throw BadRequestException if trying to delete another user collection without staffId', async () => {
      const col = { id: 'col-1', isPublic: true, userId: 'owner-id' };
      collectionRepo.findOneOrFail.mockResolvedValue(col);

      await expect(service.delete('col-1', 'attacker-id')).rejects.toThrow(BadRequestException);
    });

    it('should delete collection when owner requests', async () => {
      const col = { id: 'col-1', isPublic: true, userId: 'owner-id' };
      collectionRepo.findOneOrFail.mockResolvedValue(col);
      dataSource.manager.remove.mockResolvedValue(col);

      const result = await service.delete('col-1', 'owner-id');
      expect(result).toEqual(col);
    });
  });
});
