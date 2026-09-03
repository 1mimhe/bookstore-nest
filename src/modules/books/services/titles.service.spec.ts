import { Test, TestingModule } from '@nestjs/testing';
import { TitlesService } from './titles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Title } from '../entities/title.entity';
import { Book } from '../entities/book.entity';
import { Character } from '../entities/characters.entity';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TagsService } from '../../tags/tags.service';
import { ViewsService } from '../../views/views.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';
import { NotFoundException } from '@nestjs/common';
import { EventNames } from 'src/common/enums/event.names';

describe('TitlesService', () => {
  let service: TitlesService;
  let titleRepo: ReturnType<typeof createMockRepository>;
  let bookRepo: ReturnType<typeof createMockRepository>;
  let characterRepo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;
  let eventEmitter: Partial<EventEmitter2>;
  let tagsService: Partial<TagsService>;
  let viewsService: Partial<ViewsService>;

  beforeEach(async () => {
    titleRepo = createMockRepository();
    bookRepo = createMockRepository();
    characterRepo = createMockRepository();
    dataSource = createMockDataSource();
    eventEmitter = {
      emit: jest.fn(),
    };
    tagsService = {
      getOrCreateTags: jest.fn().mockResolvedValue([]),
    };
    viewsService = {
      getTrendingEntities: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TitlesService,
        { provide: getRepositoryToken(Title), useValue: titleRepo },
        { provide: getRepositoryToken(Book), useValue: bookRepo },
        { provide: getRepositoryToken(Character), useValue: characterRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: TagsService, useValue: tagsService },
        { provide: ViewsService, useValue: viewsService },
      ],
    }).compile();

    service = module.get<TitlesService>(TitlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create title and emit TitleCreated event', async () => {
      const dto = {
        name: 'Animal Farm',
        slug: 'animal-farm',
        authorIds: ['auth-1'],
        tags: ['political', 'satire'],
      };
      dataSource.manager.findBy.mockResolvedValue([{ id: 'auth-1' }]);
      const savedTitle = { id: 'title-1', name: 'Animal Farm' };
      dataSource.manager.create.mockReturnValue(savedTitle);
      dataSource.manager.save.mockResolvedValue(savedTitle);

      const result = await service.create(dto as any, 'user-1', 'staff-1');
      expect(result).toEqual(savedTitle);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventNames.TitleCreated,
        expect.objectContaining({ titleId: 'title-1', titleName: 'Animal Farm' }),
      );
    });

    it('should throw NotFoundException if some authors not found', async () => {
      const dto = {
        name: 'Animal Farm',
        authorIds: ['auth-1', 'auth-2'],
      };
      dataSource.manager.findBy.mockResolvedValue([{ id: 'auth-1' }]);

      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if title does not exist', async () => {
      dataSource.manager.findOne.mockResolvedValue(null);

      await expect(service.update('invalid-id', {} as any, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
