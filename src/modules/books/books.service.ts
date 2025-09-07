import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Brackets, DataSource, EntityManager, EntityNotFoundError, In, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateBookDto } from './dtos/create-book.dto';
import { Title } from './entities/title.entity';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { Publisher } from '../publishers/publisher.entity';
import { DBErrors } from 'src/common/enums/db.errors';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { Author } from '../authors/author.entity';
import { UpdateBookDto } from './dtos/update-book.dto';
import { BookImage, BookImageTypes } from './entities/book-image.entity';
import { Language } from '../languages/language.entity';
import { Bookmark, BookmarkTypes } from './entities/bookmark.entity';
import { BookmarkDto } from './dtos/bookmark.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { StaffsService } from '../staffs/staffs.service';
import { EntityTypes, StaffActionTypes } from '../staffs/entities/staff-action.entity';
import { CartBook } from './books.types';
import { BookFilterDto } from './dtos/book-filter.dto';
import { getDateRange } from 'src/common/utilities/decade.utils';
import { TitlesService } from './titles.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(BookImage) private bookImageRepo: Repository<BookImage>,
    @InjectRepository(Bookmark) private bookmarkRepo: Repository<Bookmark>,
    private dataSource: DataSource,
    private staffsService: StaffsService,
    private titleService: TitlesService
  ) {}

  async create(
    {
      titleId,
      publisherId,
      languageCode,
      translatorIds,
      ...bookDto
    }: CreateBookDto,
    staffId?: string
  ): Promise<Book | never> {
    return this.dataSource.transaction(async (manager) => {
      const [title, publisher, language, translators] = await Promise.all([
        manager.findOne(Title, { where: { id: titleId } }),
        manager.findOne(Publisher, { where: { id: publisherId } }),
        manager.findOne(Language, { where: { code: languageCode } }),
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

      if (!bookDto.name) bookDto.name = title.name;

      const book = manager.create(Book, {
        ...bookDto,
        title,
        publisher,
        translators,
        language,
      });

      const dbBook = await manager.save(Book, book);

      // Set this book as title's default book
      if (!title.defaultBookId) {
        title.defaultBookId = dbBook.id;
        await manager.save(Title, title);
      }

      if (staffId) {
        await this.staffsService.createAction(
          {
            staffId,
            type: StaffActionTypes.BookCreated,
            entityId: dbBook.id,
            entityType: EntityTypes.Book
          },
          manager
        );
      }

      return dbBook;
    }).catch((error) => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async getByPublisherId(
    publisherId: string,
    {
      page = 1,
      limit = 10,
      tags = [],
      decades = [],
      sortBy
    }: BookFilterDto
  ): Promise<Book[]> {
    const skip = (page - 1) * limit;

    const qb = this.bookRepo
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.images', 'images')
      .leftJoin('book.title', 'title')
      .where('book.publisherId = :publisherId', { publisherId });

    // Add tags filters
    if (tags.length > 0) {
      this.titleService.buildTagsConditions(qb, tags);
    }

    // Add tags filters
    if (decades.length > 0) {
      this.titleService.buildDecadeConditions(qb, decades);
    }

    // Sorting
    this.titleService.buildOrderBy(qb, sortBy);

    return qb
      .skip(skip)
      .take(limit)
      .getMany();
  }

  async getByAuthorId(
    authorId: string,
    {
      page = 1,
      limit = 10,
      tags = [],
      decades = [],
      sortBy
    }: BookFilterDto
  ): Promise<Book[]> {
    const skip = (page - 1) * limit;
    
    const qb = this.bookRepo
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.images', 'images')
      .leftJoin('book.title', 'title')
      .leftJoin('title.authors', 'authors')
      .leftJoin('book.translators', 'translators')
      .where(
        new Brackets((qb) => {
          qb.where('authors.id = :authorId', { authorId })
            .orWhere('translators.id = :authorId', { authorId });
        })
      );

    // Add tags filters
    if (tags.length > 0) {
      this.titleService.buildTagsConditions(qb, tags);
    }

    // Add tags filters
    if (decades.length > 0) {
      this.titleService.buildDecadeConditions(qb, decades);
    }

    // Sorting
    this.titleService.buildOrderBy(qb, sortBy);

    return qb
      .skip(skip)
      .take(limit)
      .getMany();
  }

  async getMultipleById(ids: string[]): Promise<CartBook[]> {
    return this.bookRepo.find({
      where: {
        id: In(ids),
        images: {
          type: In([
            BookImageTypes.Main,
            BookImageTypes.Cover
          ])
        }
      },
      relations: {
        title: true,
        publisher: true,
        images: true
      },
      select: {
        id: true,
        name: true,
        title: {
          slug: true
        },
        publisher: {
          publisherName: true
        },
        stock: true,
        price: true,
        discountPercent: true,
      }
    });
  }

  async update(
    id: string,
    {
      titleId,
      publisherId,
      languageCode,
      translatorIds,
      images,
      ...bookDto
    }: UpdateBookDto,
    staffId?: string
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
        languageCode ? manager.findOne(Language, { where: { code: languageCode } }) : existingBook.language,
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

      const dbBook = await manager.save(Book, updatedBook);

      if (staffId) {
        await this.staffsService.createAction(
          {
            staffId,
            type: StaffActionTypes.BookUpdated,
            entityId: dbBook.id,
            entityType: EntityTypes.Book
          },
          manager
        );
      }

      return dbBook;
    }).catch((error) => {
      dbErrorHandler(error);
      throw error;
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

  async bookmark(userId: string, bookmarkDto: BookmarkDto) {
    const bookmark = this.bookmarkRepo.create({
      userId,
      ...bookmarkDto
    });
    return this.bookmarkRepo.save(bookmark).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async unbookmark(userId: string, bookId: string) {
    return this.bookmarkRepo.delete({ userId, bookId });
  }

  async updateRate(
    bookId: string,
    rate: number,
    count: -1 | 0 | 1,
    manager: EntityManager
  ) {
    if (!Number.isInteger(rate) || rate < 1 || rate > 5) {
      throw new BadRequestException('Rate must be an integer between 1 and 5.');
    }
    if (count !== -1 && count !== 1) {
      throw new BadRequestException('Count must be either 1 or -1.');
    }

    const book = await manager.findOneOrFail(Book, {
      where: { id: bookId }
    }).catch(error => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Book);
      }
      throw error;
    });

    if (book.rateCount + count < 0) {
      throw new BadRequestException('Cannot reduce rate count below 0.');
    }

    // Calculate new rate
    const newSum = book.rate * book.rateCount + rate * count;
    const newRateCount = book.rateCount + count;
    const newRate = newRateCount > 0 ? Number((newSum / newRateCount).toFixed(2)) : 0;

    // Update book properties
    book.rate = newRate;
    book.rateCount = newRateCount;

    const updatedBook = await manager.save(Book, book);
    
    return {
      newRate: updatedBook.rate,
      newRateCount: updatedBook.rateCount
    };
  }
}
