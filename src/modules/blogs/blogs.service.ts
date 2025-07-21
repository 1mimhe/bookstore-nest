import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    publisherId,
    authorId,
    tags,
    ...blogDto
  }: CreateBlogDto): Promise<Blog | never> {
    return this.dataSource.transaction(async (manager) => {
      const [title, author, publisher] = await Promise.all([
          manager.findOne(Title, { where: { id: titleId } }),
          manager.findOne(Author, { where: { id: authorId } }),
          manager.findOne(Publisher, { where: { id: publisherId } }),
        ]);
    
      if (!title) throw new NotFoundException(NotFoundMessages.Title);
      if (!author) throw new NotFoundException(NotFoundMessages.Author);
      if (!publisher) throw new NotFoundException(NotFoundMessages.Publisher);

      let dbTags: Tag[] | undefined;
      if (tags && tags.length > 0) {
        dbTags = await manager.findBy(Tag, {
          name: In(tags),
        });
      }

      const blog = manager.create(Blog, {
        ...blogDto,
        title,
        author,
        publisher,
        tags: dbTags
      });

      return manager.save(Blog, blog).catch((error) => {
        if (error.code === DBErrors.Conflict) {
          throw new ConflictException(ConflictMessages.Slug);
        }
        throw error;
      });
    });
  }
}
