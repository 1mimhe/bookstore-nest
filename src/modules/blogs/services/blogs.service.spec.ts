import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { StaffsService } from '../../staffs/staffs.service';
import { ViewsService } from '../../views/views.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BlogsService', () => {
  let service: BlogsService;
  let blogRepo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;
  let staffsService: Partial<StaffsService>;
  let viewsService: Partial<ViewsService>;

  beforeEach(async () => {
    blogRepo = createMockRepository();
    dataSource = createMockDataSource();
    staffsService = {
      createAction: jest.fn().mockResolvedValue({} as any),
    };
    viewsService = {
      getTrendingEntities: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        { provide: getRepositoryToken(Blog), useValue: blogRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: StaffsService, useValue: staffsService },
        { provide: ViewsService, useValue: viewsService },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save blog and record staff action', async () => {
      const dto = { title: 'Book Review', slug: 'book-review', content: 'Great book!' };
      const saved = { id: 'blog-1', ...dto };
      dataSource.manager.create.mockReturnValue(saved);
      dataSource.manager.save.mockResolvedValue(saved);

      const result = await service.create(dto as any, 'user-1');
      expect(result).toEqual(saved);
      expect(staffsService.createAction).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return blog when found', async () => {
      const blog = { id: 'blog-1', title: 'Post' };
      blogRepo.findOneOrFail.mockResolvedValue(blog);

      const result = await service.getById('blog-1');
      expect(result).toEqual(blog);
    });

    it('should throw NotFoundException when blog not found', async () => {
      blogRepo.findOneOrFail.mockRejectedValue(new EntityNotFoundError(Blog, 'b1'));
      await expect(service.getById('b1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('get', () => {
    it('should throw BadRequestException if neither id nor slug passed', async () => {
      await expect(service.get({})).rejects.toThrow(BadRequestException);
    });
  });
});
