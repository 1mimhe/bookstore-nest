import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { DataSource, EntityNotFoundError, In, Repository } from 'typeorm';
import { CreateBookDto } from './dtos/create-book.dto';
import { Title } from './entities/title.entity';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { Publisher } from '../publishers/entities/publisher.entity';
import { DBErrors } from 'src/common/enums/db.errors';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { Author } from '../authors/entities/author.entity';
import { UpdateBookDto } from './dtos/update-book.dto';
import { BookImage } from './entities/book-image.entity';
import { Language } from '../languages/entities/language.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(BookImage) private bookImageRepo: Repository<BookImage>,
    private dataSource: DataSource,
  ) {}

  async create({
    titleId,
    publisherId,
    languageId,
    translatorIds,
    ...bookDto
  }: CreateBookDto): Promise<Book | never> {
    return this.dataSource.transaction(async (manager) => {
      const [title, publisher, language, translators] = await Promise.all([
        manager.findOne(Title, { where: { id: titleId } }),
        manager.findOne(Publisher, { where: { id: publisherId } }),
        manager.findOne(Language, { where: { id: languageId } }),
        translatorIds
          ? manager.findBy(Author, { id: In(translatorIds) })
          : Promise.resolve(undefined),
      ]);

      if (!title) throw new NotFoundException(NotFoundMessages.Title);
      if (!publisher) throw new NotFoundException(NotFoundMessages.Publisher);
      if (!language) throw new NotFoundException(NotFoundMessages.Language);

      if (
        translatorIds &&
        translators &&
        translators.length !== translatorIds.length
      ) {
        throw new NotFoundException(NotFoundMessages.SomeTranslators);
      }

      const book = manager.create(Book, {
        ...bookDto,
        title,
        publisher,
        translators,
        language,
      });

      return manager.save(Book, book).catch((error) => {
        if (error.code === DBErrors.Conflict) {
          const sqlMessage = error.driverError.sqlMessage as string;

          if (sqlMessage.includes('ISBN_UNIQUE')) {
            throw new ConflictException(ConflictMessages.ISBN);
          }
        }
        throw error;
      });
    });
  }

  async getByPublisherId(
    publisherId: string,
    page = 1,
    limit = 10,
  ): Promise<Book[]> {
    const skip = (page - 1) * limit;
    return this.bookRepo.find({
      where: { publisherId },
      skip,
      take: limit,
    });
  }

  async getByAuthorId(authorId: string, page = 1, limit = 10): Promise<Book[]> {
    const skip = (page - 1) * limit;
    return this.bookRepo.find({
      where: [
        {
          title: {
            authors: {
              id: authorId,
            },
          },
        },
        {
          translators: {
            id: authorId,
          },
        },
      ],
      skip,
      take: limit,
    });
  }

  async update(
    id: string,
    {
      titleId,
      publisherId,
      languageId,
      translatorIds,
      images,
      ...bookDto
    }: UpdateBookDto,
  ): Promise<Book | never> {
    return this.dataSource.transaction(async (manager) => {
      const existingBook = await manager.findOne(Book, {
        where: { id },
        relations: ['title', 'publisher', 'language', 'translators', 'images'],
      });

      if (!existingBook) {
        throw new NotFoundException(NotFoundMessages.Book);
      }

      const [title, publisher, language, translators] = await Promise.all([
        titleId ? manager.findOne(Title, { where: { id: titleId } }) : existingBook.title,
        publisherId ? manager.findOne(Publisher, { where: { id: publisherId } }) : existingBook.publisher,
        languageId ? manager.findOne(Language, { where: { id: languageId } }) : existingBook.language,
        translatorIds ? manager.findBy(Author, { id: In(translatorIds) }) : existingBook.translators
      ]);

      if (!title) throw new NotFoundException(NotFoundMessages.Title);
      if (!publisher) throw new NotFoundException(NotFoundMessages.Publisher);
      if (!language) throw new NotFoundException(NotFoundMessages.Language);

      if (translatorIds && translators && translators.length !== translatorIds.length) {
        throw new NotFoundException(NotFoundMessages.SomeTranslators);
      }

      let newImages: BookImage[] | undefined = undefined;
      if (images) {
        newImages = images.map((image) =>
          manager.create(BookImage, {
            ...image,
            book: existingBook,
          }),
        );
      }

      const updatedBook = manager.merge(Book, existingBook, bookDto) as Book;
      updatedBook.title = title;
      updatedBook.publisher = publisher;
      updatedBook.language = language;
      updatedBook.translators = translators;
      updatedBook.images = [...(existingBook.images || []), ...(newImages || [])];

      return manager.save(Book, updatedBook).catch((error) => {
        if (error.code === DBErrors.Conflict) {
          const sqlMessage = error.driverError.sqlMessage as string;

          if (sqlMessage.includes('ISBN_UNIQUE')) {
            throw new ConflictException(ConflictMessages.ISBN);
          }
        }
        throw error;
      });
    });
  }

  async deleteImage(id: string): Promise<BookImage | never> {
    const bookImage = await this.bookImageRepo
      .findOneOrFail({ where: { id } })
      .catch((error) => {
        if (error instanceof EntityNotFoundError) {
          throw new NotFoundException(NotFoundMessages.BookImage);
        }
        throw error;
      });
    return this.bookImageRepo.softRemove(bookImage);
  }
}
