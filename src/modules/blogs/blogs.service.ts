import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { DataSource, EntityNotFoundError, FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { Tag } from '../tags//entities/tag.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { StaffsService } from '../staffs/staffs.service';
import { EntityTypes, StaffActionTypes } from '../staffs/entities/staff-action.entity';
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

      if (staffId) {
        await this.staffsService.createAction(
          {
            staffId,
            type: StaffActionTypes.BlogCreated,
            entityId: dbBlog.id,
            entityType: EntityTypes.Blog
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

      if (staffId) {
        await this.staffsService.createAction(
          {
          staffId,
          type: StaffActionTypes.BlogUpdated,
          entityId: dbBlog.id,
          entityType: EntityTypes.Blog
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
