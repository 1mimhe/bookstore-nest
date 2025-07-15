import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateBookDto } from './dtos/create-book.dto';
import { Title } from './entities/title.entity';
import { NotFoundMessages } from 'src/common/enums/not-found.messages';
import { Publisher } from '../publishers/entities/publisher.entity';
import { DBErrors } from 'src/common/enums/db.errors';
import { ConflictMessages } from 'src/common/enums/conflict.messages';
import { Author } from '../authors/entities/author.entity';
import { Language } from './entities/language.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    private dataSource: DataSource
  ) {}

  async create({ titleId, publisherId, languageId, translatorIds, ...bookDto }: CreateBookDto): Promise<Book | never> {
    return this.dataSource.transaction(async (manager) => {
      const [title, publisher, language, translators] = await Promise.all([
        manager.findOne(Title, { where: { id: titleId } }),
        manager.findOne(Publisher, { where: { id: publisherId } }),
        manager.findOne(Language, { where: { id: languageId } }),
        translatorIds ? manager.findBy(Author, { id: In(translatorIds) }) : Promise.resolve(undefined)
      ]);

      if (!title) throw new NotFoundException(NotFoundMessages.Title);
      if (!publisher) throw new NotFoundException(NotFoundMessages.Publisher);
      if (!language) throw new NotFoundException(NotFoundMessages.Language);

      if (translatorIds && translators && translators.length !== translatorIds.length) {
        throw new NotFoundException(NotFoundMessages.SomeAuthors);
      }

      const book = manager.create(Book, {
        ...bookDto,
        title,
        publisher,
        translators,
        language
      });

      return manager.save(Book, book).catch(error => {
        if (error.code === DBErrors.Conflict) {
          const sqlMessage = error.driverError.sqlMessage as string;

          if (sqlMessage.includes('TITLE_PUBLISHER_UNIQUE')) {
            throw new ConflictException(ConflictMessages.TitlePublisher);
          }

          if (sqlMessage.includes('ISBN_UNIQUE')) {
            throw new ConflictException(ConflictMessages.ISBN);
          }
        }
        throw error;
      });
    });
  }
}
