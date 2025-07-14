import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateBookDto } from './dtos/create-book.dto';
import { Title } from './entities/title.entity';
import { NotFoundMessages } from 'src/common/enums/not-found.messages';
import { Publisher } from '../publishers/entities/publisher.entity';
import { DBErrors } from 'src/common/enums/db.errors';
import { ConflictMessages } from 'src/common/enums/conflict.messages';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    private dataSource: DataSource
  ) {}

  async create({ titleId, publisherId, ...bookDto }: CreateBookDto): Promise<Book | never> {
    return this.dataSource.transaction(async (manager) => {
      const title = await manager.findOne(Title, {
        where: { id: titleId }
      });
      if (!title) {
        throw new NotFoundException(NotFoundMessages.Title);
      }

      const publisher = await manager.findOne(Publisher, {
        where: { id: publisherId }
      });
      if (!publisher) {
        throw new NotFoundException(NotFoundMessages.Publisher);
      }

      const book = manager.create(Book, {
        ...bookDto,
        titleId,
        publisherId,
        title,
        publisher
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
