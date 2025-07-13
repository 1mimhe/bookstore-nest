import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Title } from './entities/title.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateTitleDto } from './dtos/create-title.dto';
import { DBErrors } from 'src/common/enums/db.errors';
import { ConflictMessages } from 'src/common/enums/conflict.messages';
import { Author } from '../authors/entities/author.entity';
import { NotFoundMessages } from 'src/common/enums/not-found.messages';

@Injectable()
export class TitlesService {
  constructor(
    @InjectRepository(Title) private titleRepo: Repository<Title>,
    private dataSource: DataSource,
  ) {}

  async create({ authorIds, ...titleDto }: CreateTitleDto): Promise<Title | never> {
    return this.dataSource.transaction(async (manager) => {
      const authors = await manager.findBy(Author, {
        id: In(authorIds)
      });

      if (authors.length !== authorIds.length) {
        throw new NotFoundException(NotFoundMessages.SomeAuthors);
      }

      const title = manager.create(Title, {
        ...titleDto,
        authors
      });

      return manager.save(Title, title).catch(error => {
        if (error.code === DBErrors.Conflict) {
          throw new ConflictException(ConflictMessages.Slug);
        }
        throw error;
      });
    });
  }
}
