import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import { BookImage } from '../entities/book-image.entity';
import { Bookmark } from '../entities/bookmark.entity';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TitlesService } from './titles.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';
import { NotFoundException } from '@nestjs/common';
import { EventNames } from 'src/common/enums/event.names';
import { Title } from '../entities/title.entity';
import { Publisher } from '../../publishers/publisher.entity';
import { Language } from '../../languages/language.entity';

describe('BooksService', () => {
  let service: BooksService;
  let bookRepo: ReturnType<typeof createMockRepository>;
  let bookImageRepo: ReturnType<typeof createMockRepository>;
  let bookmarkRepo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;
  let eventEmitter: Partial<EventEmitter2>;
  let titleService: Partial<TitlesService>;

  beforeEach(async () => {
    bookRepo = createMockRepository();
    bookImageRepo = createMockRepository();
    bookmarkRepo = createMockRepository();
    dataSource = createMockDataSource();
    eventEmitter = {
      emit: jest.fn(),
    };
    titleService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: bookRepo },
        { provide: getRepositoryToken(BookImage), useValue: bookImageRepo },
        { provide: getRepositoryToken(Bookmark), useValue: bookmarkRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: TitlesService, useValue: titleService },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create book edition and emit BookCreated event', async () => {
      const mockTitle = { id: 't1', name: 'Title 1', defaultBookId: null };
      const mockPub = { id: 'p1', name: 'Pub 1' };
      const mockLang = { id: 'l1', code: 'en' };

      dataSource.manager.findOne.mockImplementation((entity: any) => {
        if (entity === Title) return Promise.resolve(mockTitle);
        if (entity === Publisher) return Promise.resolve(mockPub);
        if (entity === Language) return Promise.resolve(mockLang);
        return Promise.resolve(null);
      });

      const savedBook = { id: 'b1', titleId: 't1', ISBN: '978-3-16-148410-0' };
      dataSource.manager.create.mockReturnValue(savedBook);
      dataSource.manager.save.mockResolvedValue(savedBook);

      const result = await service.create(
        {
          titleId: 't1',
          publisherId: 'p1',
          languageCode: 'en',
          price: 25,
          stock: 10,
        } as any,
        'user-1',
        'staff-1',
      );

      expect(result).toEqual(savedBook);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventNames.BookCreated,
        expect.objectContaining({ bookId: 'b1', titleId: 't1' }),
      );
    });

    it('should throw NotFoundException if title is not found', async () => {
      dataSource.manager.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          { titleId: 'invalid', publisherId: 'p1', languageCode: 'en' } as any,
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRate', () => {
    it('should update rate and count on book', async () => {
      const mockManager = {
        findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1', rate: 4, rateCount: 2 }),
        save: jest.fn((_, entity) => Promise.resolve(entity)),
      };

      const result = await service.updateRate('b1', 5, 1, mockManager as any);
      expect(result.newRateCount).toBe(3);
      expect(result.newRate).toBe(4.33);
    });
  });
});
