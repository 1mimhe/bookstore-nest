import { Test, TestingModule } from '@nestjs/testing';
import { PublishersService } from './publishers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Publisher } from '../entities/publisher.entity';
import { AuthService } from '../../auth/auth.service';
import { BooksService } from '../../books/books.service';
import { BlogsService } from '../../blogs/blogs.service';
import { ViewsService } from '../../views/views.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';
import { DBErrors } from 'src/common/enums/db.errors';

describe('PublishersService', () => {
  let service: PublishersService;
  let publisherRepo: ReturnType<typeof createMockRepository>;
  let authService: Partial<AuthService>;
  let booksService: Partial<BooksService>;
  let blogsService: Partial<BlogsService>;
  let viewsService: Partial<ViewsService>;

  beforeEach(async () => {
    publisherRepo = createMockRepository();
    authService = {
      signup: jest.fn().mockImplementation(async (dto, roles, cb) => {
        const mockUser = { id: 'user-1' };
        const mockManager = {
          create: jest.fn().mockReturnValue({ id: 'pub-1', ...dto }),
          save: jest.fn().mockResolvedValue({ id: 'pub-1', ...dto }),
        };
        return cb(mockUser, mockManager);
      }),
    };
    booksService = {
      getAll: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'book-1' } as any),
    };
    blogsService = {
      getById: jest.fn().mockResolvedValue({ id: 'blog-1', publisherId: 'pub-1' } as any),
      create: jest.fn().mockResolvedValue({ id: 'blog-1' } as any),
      update: jest.fn().mockResolvedValue({ id: 'blog-1' } as any),
    };
    viewsService = {
      getTrendingEntities: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishersService,
        { provide: getRepositoryToken(Publisher), useValue: publisherRepo },
        { provide: AuthService, useValue: authService },
        { provide: BooksService, useValue: booksService },
        { provide: BlogsService, useValue: blogsService },
        { provide: ViewsService, useValue: viewsService },
      ],
    }).compile();

    service = module.get<PublishersService>(PublishersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should delegate signup to authService and create publisher', async () => {
      const dto = {
        publisherName: 'Penguin',
        slug: 'penguin',
        email: 'p@test.com',
        username: 'penguin',
        password: 'Password123!',
      };

      const result = await service.signup(dto as any);
      expect(authService.signup).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'pub-1');
    });
  });

  describe('get', () => {
    it('should return publisher by id', async () => {
      const pub = { id: 'pub-1', publisherName: 'Penguin' };
      publisherRepo.findOneOrFail.mockResolvedValue(pub);

      const result = await service.get({ id: 'pub-1' });
      expect(result.publisherName).toBe('Penguin');
    });

    it('should throw BadRequestException if neither id nor slug passed', async () => {
      await expect(service.get({})).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if publisher not found', async () => {
      publisherRepo.findOneOrFail.mockRejectedValue(new EntityNotFoundError(Publisher, '1'));
      await expect(service.get({ id: 'pub-1' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('createBook', () => {
    it('should find publisher by userId and delegate create to booksService', async () => {
      publisherRepo.findOneOrFail.mockResolvedValue({ id: 'pub-1', userId: 'user-1' });

      await service.createBook('user-1', { titleId: 't1' } as any);
      expect(booksService.create).toHaveBeenCalledWith(
        expect.objectContaining({ publisherId: 'pub-1', titleId: 't1' }),
        'user-1',
      );
    });
  });

  describe('updateBlog', () => {
    it('should update blog if publisher owns it', async () => {
      publisherRepo.findOneOrFail.mockResolvedValue({ id: 'pub-1', userId: 'user-1' });

      await service.updateBlog('blog-1', 'user-1', { title: 'New' } as any);
      expect(blogsService.update).toHaveBeenCalledWith('blog-1', { title: 'New' }, 'user-1');
    });

    it('should throw BadRequestException if publisher does not own blog', async () => {
      publisherRepo.findOneOrFail.mockResolvedValue({ id: 'pub-other', userId: 'user-1' });

      await expect(service.updateBlog('blog-1', 'user-1', {} as any)).rejects.toThrow(BadRequestException);
    });
  });
});
