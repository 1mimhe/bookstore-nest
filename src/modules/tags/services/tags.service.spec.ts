import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tag } from '../entities/tag.entity';
import { Title } from '../../books/entities/title.entity';
import { RootTag } from '../entities/root-tag.entity';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { StaffsService } from '../../staffs/staffs.service';
import { ViewsService } from '../../views/views.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;
  let tagRepo: ReturnType<typeof createMockRepository>;
  let titleRepo: ReturnType<typeof createMockRepository>;
  let rootTagRepo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;
  let staffsService: Partial<StaffsService>;
  let viewsService: Partial<ViewsService>;

  beforeEach(async () => {
    tagRepo = createMockRepository();
    titleRepo = createMockRepository();
    rootTagRepo = createMockRepository();
    dataSource = createMockDataSource();
    staffsService = {
      createAction: jest.fn().mockResolvedValue({} as any),
    };
    viewsService = {
      getTrendingEntities: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: getRepositoryToken(Tag), useValue: tagRepo },
        { provide: getRepositoryToken(Title), useValue: titleRepo },
        { provide: getRepositoryToken(RootTag), useValue: rootTagRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: StaffsService, useValue: staffsService },
        { provide: ViewsService, useValue: viewsService },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new tag and record staff action', async () => {
      const dto = { name: 'Fiction', description: 'Fictional books' };
      const saved = { id: 'tag-1', ...dto };
      tagRepo.create.mockReturnValue(saved);
      tagRepo.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, 'user-1');
      expect(result).toEqual(saved);
      expect(staffsService.createAction).toHaveBeenCalled();
    });
  });

  describe('getOrCreateTags', () => {
    it('should return empty list when given empty array', async () => {
      const result = await service.getOrCreateTags([], {} as any);
      expect(result).toEqual([]);
    });

    it('should find existing tags and create non-existing ones', async () => {
      const mockManager = {
        findBy: jest.fn().mockResolvedValue([{ id: '1', name: 'Sci-Fi' }]),
        save: jest.fn().mockResolvedValue([{ id: '2', name: 'Fantasy', slug: 'fantasy' }]),
      };
      tagRepo.create.mockReturnValue({ name: 'Fantasy', slug: 'fantasy' });

      const result = await service.getOrCreateTags(['Sci-Fi', 'Fantasy'], mockManager as any);
      expect(result).toHaveLength(2);
      expect(mockManager.save).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return tag when found', async () => {
      tagRepo.findOneOrFail.mockResolvedValue({ id: 'tag-1', name: 'Fiction' });
      const result = await service.getById('tag-1');
      expect(result.id).toBe('tag-1');
    });

    it('should throw NotFoundException when tag does not exist', async () => {
      tagRepo.findOneOrFail.mockRejectedValue(new EntityNotFoundError(Tag, 'tag-99'));
      await expect(service.getById('tag-99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createRootTag', () => {
    it('should create root tag with incremented order', async () => {
      tagRepo.findOne.mockResolvedValue({ id: 'tag-1' });
      rootTagRepo.maximum.mockResolvedValue(3);
      rootTagRepo.create.mockReturnValue({ tagId: 'tag-1', order: 4 });
      rootTagRepo.save.mockResolvedValue({ id: 'rt-1', tagId: 'tag-1', order: 4 });

      const result = await service.createRootTag({ tagId: 'tag-1' } as any);
      expect(result.order).toBe(4);
      expect(rootTagRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tag does not exist', async () => {
      tagRepo.findOne.mockResolvedValue(null);
      await expect(service.createRootTag({ tagId: 'tag-invalid' } as any)).rejects.toThrow(NotFoundException);
    });
  });
});
