import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Title } from './entities/title.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateTitleDto } from './dtos/create-title.dto';
import { DBErrors } from 'src/common/enums/db.errors';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { Author } from '../authors/entities/author.entity';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateTitleDto } from './dtos/update-title.dto';

@Injectable()
export class TitlesService {
  constructor(
    @InjectRepository(Title) private titleRepo: Repository<Title>,
    private dataSource: DataSource,
  ) {}

  async create({
    authorIds,
    ...titleDto
  }: CreateTitleDto): Promise<Title | never> {
    return this.dataSource.transaction(async (manager) => {
      const authors = await manager.findBy(Author, {
        id: In(authorIds),
      });

      if (authors.length !== authorIds.length) {
        throw new NotFoundException(NotFoundMessages.SomeAuthors);
      }

      const title = manager.create(Title, {
        ...titleDto,
        authors,
      });

      return manager.save(Title, title).catch((error) => {
        if (error.code === DBErrors.Conflict) {
          throw new ConflictException(ConflictMessages.Slug);
        }
        throw error;
      });
    });
  }

  async update(id: string, { authorIds, ...titleDto }: UpdateTitleDto): Promise<Title | never> {
    return this.dataSource.transaction(async (manager) => {
      const existingTitle = await manager.findOne(Title, {
        where: { id },
        relations: ['authors'],
      });

      if (!existingTitle) {
        throw new NotFoundException(NotFoundMessages.Title);
      }

      let authors = existingTitle.authors;
      if (authorIds && authorIds.length > 0) {
        const foundAuthors = await manager.findBy(Author, {
          id: In(authorIds),
        });

        if (foundAuthors.length !== authorIds.length) {
          throw new NotFoundException(NotFoundMessages.SomeAuthors);
        }

        authors = foundAuthors;
      }

      const updatedTitle = manager.merge(Title, existingTitle, titleDto) as Title;
      updatedTitle.authors = authors;

      return manager.save(Title, updatedTitle).catch((error) => {
        if (error.code === DBErrors.Conflict) {
          throw new ConflictException(ConflictMessages.Slug);
        }
        throw error;
      });
    });
  }
}
