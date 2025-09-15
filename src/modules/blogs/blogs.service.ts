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
import { BlogFilterDto } from './dtos/blog-filter.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private blogRepo: Repository<Blog>,
    private dataSource: DataSource,
    private staffsService: StaffsService
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
      page,
      limit,
      ...blogFilterDto
    }: BlogFilterDto
  ) {
    const skip = (page - 1) * limit;
    return this.blogRepo.find({
      where: blogFilterDto,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC'
      }
    });
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
