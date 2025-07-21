import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { DataSource, EntityNotFoundError, FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { Tag } from '../tags/tag.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private blogRepo: Repository<Blog>,
    private dataSource: DataSource,
  ) {}

  async create({ tags, ...blogDto }: CreateBlogDto): Promise<Blog | never> {
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

      return manager.save(Blog, blog).catch((error) => {
        dbErrorHandler(error);
        throw error;
      });
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
    const where: FindOptionsWhere<Blog> = {};
    if (identifier.id) {
      where.id = identifier.id;
    } else if (identifier.slug) {
      where.slug = identifier.slug;
    } else {
      throw new BadRequestException('Either id or slug must be provided.');
    }

    return this.blogRepo.findOneOrFail({
      where,
      relations: ['title', 'author', 'publisher', 'tags']
    }).catch((error: Error) => {
        if (error instanceof EntityNotFoundError) {
          throw new NotFoundException(NotFoundMessages.Blog);
        }
        throw error;
      });
  }

  async update(
    id: string,
    { tags, ...blogDto }: UpdateBlogDto
  ): Promise<Blog | never> {
    return this.dataSource.transaction(async (manager) => {
      const existingBlog = await manager.findOne(Blog, {
        where: { id },
        relations: ['tags']
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

      return manager.save(Blog, updatedBlog).catch((error) => {
        dbErrorHandler(error);
        throw error;
      });
    });     
  }
}
