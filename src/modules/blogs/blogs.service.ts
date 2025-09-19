import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { DataSource, EntityNotFoundError, FindOptionsWhere, In, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { Tag } from '../tags//entities/tag.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { StaffsService } from '../staffs/staffs.service';
import { EntityTypes, StaffActionTypes } from '../staffs/entities/staff-action.entity';
import { BlogFilterDto, SortBy } from './dtos/blog-filter.dto';
import { TrendingPeriod, ViewEntityTypes } from '../views/views.types';
import { ViewsService } from '../views/views.service';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private blogRepo: Repository<Blog>,
    private dataSource: DataSource,
    private staffsService: StaffsService,
    private viewsService: ViewsService
  ) {}

  async create(
    {
      tags,
      ...blogDto
    }: CreateBlogDto,
    userId: string,
    staffId?: string
  ): Promise<Blog | never> {
    return this.dataSource.transaction(async (manager) => {
      let dbTags: Tag[] | undefined;
      if (tags && tags.length > 0) {
        dbTags = await manager.findBy(Tag, {
          name: In(tags),
        });
      }      

      const blog = manager.create(Blog, {
        ...blogDto,
        tags: dbTags
      });

      const dbBlog = await manager.save(Blog, blog);

      if (userId) {
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.BlogCreated,
            entityId: dbBlog.id,
            entityType: EntityTypes.Blog,
            newValue: JSON.stringify(blog)
          },
          manager
        );
      }

      return dbBlog;
    }).catch((error) => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async getById(id: string) {
    return this.blogRepo.findOneOrFail({
      where: { id }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Blog);
      }
      throw error;
    });
  }

  async get(
    identifier: { 
      id?: string;
      slug?: string
    },
  ): Promise<Blog | never> {
    const where: FindOptionsWhere<Blog> = {
      isPublic: true
    };
    if (identifier.id) {
      where.id = identifier.id;
    } else if (identifier.slug) {
      where.slug = identifier.slug;
    } else {
      throw new BadRequestException('Either id or slug must be provided.');
    }

    return this.blogRepo.findOneOrFail({
      where,
      relations: {
        title: true,
        author: true,
        publisher: true,
        tags: true
      },
    }).catch((error: Error) => {
        if (error instanceof EntityNotFoundError) {
          throw new NotFoundException(NotFoundMessages.Blog);
        }
        throw error;
      });
  }

  async getAll(
    {
      page = 1,
      limit = 10,
      sortBy,
      tags,
      search,
      ...filters
    }: BlogFilterDto
  ): Promise<Blog[]> {
    const skip = (page - 1) * limit;
    const qb = this.blogRepo.createQueryBuilder('blog');

    // Apply filters
    this.applyFilters(qb, filters);
    this.buildTagsConditions(qb, tags);

    // Search filter
    if (search) {
      qb.andWhere(
        '(LOWER(book.subject) LIKE LOWER(:search) OR ' +
        'LOWER(book.otherSubject) LIKE LOWER(:search) OR ' +
        'LOWER(book.slug) LIKE LOWER(:search) OR ' +
        'LOWER(book.summary) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    this.buildOrderBy(qb, sortBy);

    return qb
      .skip(skip)
      .take(limit)
      .getMany();
  }

  private applyFilters(
    qb: SelectQueryBuilder<Blog>,
    filters: Omit<BlogFilterDto, 'page' | 'limit' | 'sortBy'>
  ): void {
    if (filters.titleId) {
      qb.andWhere('blog.titleId = :titleId', { titleId: filters.titleId });
    }

    if (filters.authorId) {
      qb.andWhere('blog.authorId = :authorId', { authorId: filters.authorId });
    }

    if (filters.publisherId) {
      qb.andWhere('blog.publisherId = :publisherId', { publisherId: filters.publisherId });
    }
  }

  private buildTagsConditions(
    qb: SelectQueryBuilder<Blog>,
    tags: string[] = []
  ): void {
    if (tags.length > 0) {
      qb.andWhere(
        qb => {
          const subQuery = qb
            .subQuery()
            .select('1')
            .from('blog_tag', 'bt')
            .innerJoin('tags', 't', 'bt.tagId = t.id')
            .where('bt.blogId = blog.id')
            .andWhere('t.slug IN (:...tags)')
            .getQuery();
          return `EXISTS (${subQuery})`;
        }
      )
      .setParameter('tags', tags);
    }
  }

  private buildOrderBy(
    qb: SelectQueryBuilder<Blog>,
    by: SortBy = SortBy.Newest
  ): void {
    const entityType = qb.expressionMap.mainAlias?.metadata?.targetName;

    if (entityType === 'Blog') {
      switch (by) {
        case SortBy.MostView:
          qb.orderBy('blog.views', 'DESC');
          break;
        case SortBy.Newest:
        default:
          qb.orderBy('blog.createdAt', 'DESC');
          break;
      }
    }
  }

  async getTrending(
    period: TrendingPeriod,
    limit?: number
  ): Promise<Blog[]> {
    const trendingData = await this.viewsService.getTrendingEntities(
      ViewEntityTypes.Blog,
      period,
      limit
    );

    if (!trendingData || trendingData.length === 0) {
      return [];
    }

    const blogIds = trendingData.map(item => item.entityId);
    const blogs = await this.blogRepo.find({
      where: {
        id: In(blogIds)
      }
    });

    const entityMap = new Map(blogs.map(entity => [entity.id, entity]));
    return trendingData.map(t => (
      entityMap.get(t.entityId)
    ))
    .filter(e => e !== undefined);
  }

  async update(
    id: string,
    {
      tags,
      ...blogDto
    }: UpdateBlogDto,
    userId: string,
    staffId?: string
  ): Promise<Blog | never> {
    return this.dataSource.transaction(async (manager) => {
      const existingBlog = await manager.findOne(Blog, {
        where: { id },
        relations: {
          tags: true
        }
      });

      if (!existingBlog) {
        throw new NotFoundException(NotFoundMessages.Blog);
      }

      let newTags: Tag[] | undefined;
      if (tags && tags.length > 0) {
        newTags = await manager.findBy(Tag, {
          name: In(tags),
        });
      }

      const updatedBlog = manager.merge(
        Blog,
        existingBlog,
        blogDto,
      ) as Blog;
      updatedBlog.tags = [...(existingBlog.tags || []), ...(newTags || [])];

      const dbBlog = await manager.save(Blog, updatedBlog);

      if (userId) {
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.BlogUpdated,
            entityId: dbBlog.id,
            entityType: EntityTypes.Blog,
            oldValue: JSON.stringify(existingBlog),
            newValue: JSON.stringify(updatedBlog)
          },
          manager
        );
      }

      return dbBlog;
    }).catch((error) => {
      dbErrorHandler(error);
      throw error;
    });     
  }
}
