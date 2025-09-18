import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './author.entity';
import { Brackets, DataSource, EntityManager, EntityNotFoundError, FindOptionsWhere, In, Repository, SelectQueryBuilder } from 'typeorm';
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
import { TrendingPeriod, ViewEntityTypes } from '../views/views.types';
import { ViewsService } from '../views/views.service';
import { AuthorFilterDto, SortBy } from './dtos/author-filter.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author) private authorRepo: Repository<Author>,
    private dataSource: DataSource,
    private booksService: BooksService,
    private staffsService: StaffsService,
    private viewsService: ViewsService
  ) {}

  async create(
    authorDto: CreateAuthorDto,
    userId: string,
    staffId?: string
  ): Promise<Author | never> {
    return this.dataSource.transaction(async manager => {
      const author = manager.create(Author, authorDto);
      const dbAuthor = await manager.save(Author, author).catch((error) => {
        if (error.code === DBErrors.Conflict) {
          throw new ConflictException(ConflictMessages.Slug);
        }
        throw error;
      });

      if (userId) {
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.AuthorCreated,
            entityId: dbAuthor.id,
            entityType: EntityTypes.Author,
            newValue: JSON.stringify(author)
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

  async getAll(
    {
      page = 1,
      limit = 10,
      search,
      sortBy
    }: AuthorFilterDto
  ): Promise<(Author & { bookCount: number })[]> {
    const skip = (page - 1) * limit;
    const qb = this.authorRepo
      .createQueryBuilder('author')
      .leftJoin('author.titles', 'titles')
      .leftJoin('author.books', 'books')
      .select(['author', 'COUNT(books.id) + COUNT(titles.id) as bookCount'])
      .groupBy('author.id');

    // Search filter across combined names
    if (search) {
      qb.andWhere(
        'LOWER(CONCAT(author.firstName, \' \', author.lastName, \' \', author.nickName)) LIKE LOWER(:search) OR ' +
        '(LOWER(author.slug) LIKE LOWER(:search) OR ',
        { search: `%${search}%` }
      );
    }

    // Sorting
    this.buildOrderBy(qb, sortBy);

    const authors = await qb
      .skip(skip)
      .limit(limit)
      .getRawAndEntities();
    
    return authors.entities.map((author, index) => ({
      ...author,
      bookCount: parseInt(authors.raw[index].bookCount, 10),
    }));
  }

  private buildOrderBy(
    qb: SelectQueryBuilder<Author>,
    sortBy: SortBy = SortBy.Newest
  ): void {
    switch (sortBy) {
      case SortBy.NameAsc:
        qb.orderBy('author.firstName', 'ASC')
          .addOrderBy('author.lastName', 'ASC');
        break;
      case SortBy.NameDesc:
        qb.orderBy('author.firstName', 'DESC')
          .addOrderBy('author.lastName', 'DESC');
        break;
      case SortBy.MostBooks:
        qb.orderBy('bookCount', 'DESC');
        break;
      case SortBy.MostView:
        qb.orderBy('author.views', 'DESC');
        break;
      case SortBy.Newest:
      default:
        qb.orderBy('author.createdAt', 'DESC');
        break;
    }
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
      books = await this.booksService.getAll({
        authorId: author.id,
        page,
        limit
      });
    }

    return {
      ...author,
      books
    };
  }

  async getTrending(
    period: TrendingPeriod,
    limit?: number
  ): Promise<Author[]> {
    const trendingData = await this.viewsService.getTrendingEntities(
      ViewEntityTypes.Author,
      period,
      limit
    );

    if (!trendingData || trendingData.length === 0) {
      return [];
    }

    const authorIds = trendingData.map(item => item.entityId);
    const authors = await this.authorRepo.find({
      where: {
        id: In(authorIds)
      }
    });

    const entityMap = new Map(authors.map(entity => [entity.id, entity]));
    return trendingData.map(t => (
      entityMap.get(t.entityId)
    ))
    .filter(e => e !== undefined);
  }

  async update(
    id: string,
    authorDto: UpdateAuthorDto,
    userId: string,
    staffId?: string
  ): Promise<Author | never> {
    return this.dataSource.transaction(async manager => {
      const author = await this.getById(id, manager);
      Object.assign(author, authorDto);
      const dbAuthor = await manager.save(Author, author);

      if (userId) {
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.AuthorUpdated,
            entityId: dbAuthor.id,
            entityType: EntityTypes.Author,
            oldValue: JSON.stringify(author),
            newValue: JSON.stringify(dbAuthor)
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

  async delete(
    id: string,
    userId: string,
    staffId?: string
  ): Promise<Author | never> {
    return this.dataSource.transaction(async manager => {
      const author = await this.getById(id, manager);
      const result = await manager.softRemove(Author, author);

      if (userId) {
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.AuthorDeleted,
            entityId: result.id,
            entityType: EntityTypes.Author,
            oldValue: JSON.stringify(author)
          },
          manager
        );
      }

      return result;
    });
  }
}
