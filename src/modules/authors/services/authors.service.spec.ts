import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Author } from '../entities/author.entity';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { BooksService } from '../../books/books.service';
import { StaffsService } from '../../staffs/staffs.service';
import { ViewsService } from '../../views/views.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DBErrors } from 'src/common/enums/db.errors';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let authorRepo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;
  let booksService: Partial<BooksService>;
  let staffsService: Partial<StaffsService>;
  let viewsService: Partial<ViewsService>;

  beforeEach(async () => {
    authorRepo = createMockRepository();
    dataSource = createMockDataSource();
    booksService = {
      getAll: jest.fn().mockResolvedValue([]),
    };
    staffsService = {
      createAction: jest.fn().mockResolvedValue({} as any),
    };
    viewsService = {
      getTrendingEntities: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: getRepositoryToken(Author), useValue: authorRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: BooksService, useValue: booksService },
        { provide: StaffsService, useValue: staffsService },
        { provide: ViewsService, useValue: viewsService },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create author and record staff action', async () => {
      const dto = { firstName: 'George', lastName: 'Orwell', slug: 'george-orwell' };
      const created = { id: 'author-1', ...dto };
      dataSource.manager.create.mockReturnValue(created);
      dataSource.manager.save.mockResolvedValue(created);

      const result = await service.create(dto as any, 'user-1', 'staff-1');
      expect(result).toEqual(created);
      expect(staffsService.createAction).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate slug', async () => {
      const dto = { firstName: 'George', lastName: 'Orwell', slug: 'george-orwell' };
      dataSource.manager.create.mockReturnValue(dto);
      dataSource.manager.save.mockRejectedValue({ code: DBErrors.Conflict });

      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('getById', () => {
    it('should return author when found', async () => {
      const author = { id: 'author-1', firstName: 'George' };
      authorRepo.findOneOrFail.mockResolvedValue(author);

      const result = await service.getById('author-1');
      expect(result).toEqual(author);
    });

    it('should throw NotFoundException when not found', async () => {
      authorRepo.findOneOrFail.mockRejectedValue(new EntityNotFoundError(Author, 'author-1'));

      await expect(service.getById('author-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('get', () => {
    it('should find author by slug', async () => {
      const author = { id: 'a1', slug: 'george-orwell' };
      authorRepo.findOneOrFail.mockResolvedValue(author);

      const result = await service.get({ slug: 'george-orwell' });
      expect(result.slug).toBe('george-orwell');
      expect(result.books).toEqual([]);
    });

    it('should throw BadRequestException if neither id nor slug provided', async () => {
      await expect(service.get({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update author and record staff action', async () => {
      const author = { id: 'author-1', firstName: 'George', lastName: 'Orwell' };
      dataSource.manager.getRepository().findOneOrFail.mockResolvedValue(author);
      dataSource.manager.save.mockResolvedValue({ ...author, firstName: 'Eric' });

      const result = await service.update('author-1', { firstName: 'Eric' }, 'user-1');
      expect(result.firstName).toBe('Eric');
      expect(staffsService.createAction).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete author and record action', async () => {
      const author = { id: 'author-1', firstName: 'George' };
      dataSource.manager.getRepository().findOneOrFail.mockResolvedValue(author);
      dataSource.manager.softRemove.mockResolvedValue(author);

      const result = await service.delete('author-1', 'user-1');
      expect(result).toEqual(author);
      expect(dataSource.manager.softRemove).toHaveBeenCalled();
    });
  });
});
