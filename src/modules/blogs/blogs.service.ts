import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Title } from '../books/entities/title.entity';
import { Publisher } from '../publishers/publisher.entity';
import { Author } from '../authors/author.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { ConflictMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { Tag } from '../tags/tag.entity';
import { DBErrors } from 'src/common/enums/db.errors';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private blogRepo: Repository<Blog>,
    private dataSource: DataSource,
  ) {}

  async create({
    titleId,
    authorId,
    publisherId,
    tags,
    ...blogDto
  }: CreateBlogDto): Promise<Blog | never> {
    return this.dataSource.transaction(async (manager) => {
      let dbTags: Tag[] | undefined;
      if (tags && tags.length > 0) {
        dbTags = await manager.findBy(Tag, {
          name: In(tags),
        });
      }      

      const blog = manager.create(Blog, {
        ...blogDto,
        titleId,
        authorId,
        publisherId,
        tags: dbTags
      });

      return manager.save(Blog, blog).catch((error) => {
        if (error.code === DBErrors.Conflict) {
          throw new ConflictException(ConflictMessages.Slug);
        }
        if (error.code === DBErrors.ReferenceNotFound) {
          if (error.message.includes('titleId')) {
            throw new NotFoundException(NotFoundMessages.Title);
          }
          if (error.message.includes('authorId')) {
            throw new NotFoundException(NotFoundMessages.Author);
          }
          if (error.message.includes('publisherId')) {
            throw new NotFoundException(NotFoundMessages.Publisher);
          }
        }
        throw error;
      });
    });
  }
}
