import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './author.entity';
import { DataSource, EntityManager, EntityNotFoundError, FindOptionsWhere, Repository } from 'typeorm';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateAuthorDto } from './dtos/update-author.dto';
import { DBErrors } from 'src/common/enums/db.errors';
import { BooksService } from '../books/books.service';
import { Book } from '../books/entities/book.entity';
import { StaffsService } from '../staffs/staffs.service';
import { EntityTypes, StaffActionTypes } from '../staffs/entities/staff-action.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author) private authorRepo: Repository<Author>,
    private dataSource: DataSource,
    private booksService: BooksService,
    private staffsService: StaffsService
  ) {}

  async create(authorDto: CreateAuthorDto, staffId?: string): Promise<Author | never> {
    return this.dataSource.transaction(async manager => {
      const author = manager.create(Author, authorDto);
      const dbAuthor = await manager.save(Author, author).catch((error) => {
        if (error.code === DBErrors.Conflict) {
          throw new ConflictException(ConflictMessages.Slug);
        }
        throw error;
      });

      if (staffId) {
        await this.staffsService.createAction(
          {
          staffId,
          type: StaffActionTypes.AuthorCreated,
          entityId: dbAuthor.id,
          entityType: EntityTypes.Author
          },
          manager
        );
      }

      return dbAuthor;
    });
  }

  async getById(
    id: string,
    manager?: EntityManager
  ): Promise<Author | never> {
    const repository = manager ? manager.getRepository(Author) : this.authorRepo;
    return repository.findOneOrFail({
      where: { id }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Author);
      }
      throw error;
    });
  }

  async getAll(page = 1, limit = 10): Promise<(Author & { bookCount: number })[]> {
    const skip = (page - 1) * limit;
    const authors = await this.authorRepo
      .createQueryBuilder('author')
      .leftJoin('author.titles', 'titles')
      .leftJoin('author.books', 'books')
      .select(['author', 'COUNT(books.id) + COUNT(titles.id) as bookCount'])
      .groupBy('author.id')
      .skip(skip)
      .limit(limit)
      .getRawAndEntities();
    
    return authors.entities.map((author, index) => ({
      ...author,
      bookCount: parseInt(authors.raw[index].bookCount),
    }));
  }

  async get(
    identifier: { id?: string; slug?: string },
    page: number = 1,
    limit: number = 10,
    complete = false,
  ): Promise<Author | never> {
    const where: FindOptionsWhere<Author> = {};
    if (identifier.id) {
      where.id = identifier.id;
    } else if (identifier.slug) {
      where.slug = identifier.slug;
    } else {
      throw new BadRequestException('Either id or slug must be provided.');
    }

    const author = await this.authorRepo.findOneOrFail({
      where
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Author);
      }
      throw error;
    });

    let books: Book[] = [];
    if (complete) {
      books = await this.booksService.getByAuthorId(author.id, page, limit);
    }

    return {
      ...author,
      books
    };
  }

  async update(
    id: string,
    authorDto: UpdateAuthorDto,
    staffId?: string
  ): Promise<Author | never> {
    return this.dataSource.transaction(async manager => {
      const author = await this.getById(id, manager);
      Object.assign(author, authorDto);
      const dbAuthor = await manager.save(Author, author);

      if (staffId) {
        await this.staffsService.createAction(
          {
          staffId,
          type: StaffActionTypes.AuthorUpdated,
          entityId: dbAuthor.id,
          entityType: EntityTypes.Author
          },
          manager
        );
      }

      return dbAuthor;
    }).catch((error) => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async delete(id: string): Promise<Author | never> {
    const profile = await this.getById(id);
    return this.authorRepo.softRemove(profile);
  }
}
