import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { Tag } from '../tags/tag.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';

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
        dbErrorHandler(error);
        throw error;
      });
    });
  }
}
