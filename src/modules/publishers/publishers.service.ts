import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Publisher } from './publisher.entity';
import { EntityManager, EntityNotFoundError, FindOptionsWhere, In, Repository, SelectQueryBuilder } from 'typeorm';
import { RolesEnum } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { SignupPublisherDto } from './dtos/create-publisher.dto';
import { BadRequestMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdatePublisherDto } from './dtos/update-publisher.dto';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { DBErrors } from 'src/common/enums/db.errors';
import { AuthService } from '../auth/auth.service';
import { BooksService } from '../books/books.service';
import { Book } from '../books/entities/book.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { CreateBookDto } from '../books/dtos/create-book.dto';
import { BlogsService } from '../blogs/blogs.service';
import { CreateBlogDto } from '../blogs/dtos/create-blog.dto';
import { UpdateBlogDto } from '../blogs/dtos/update-blog.dto';
import { TrendingPeriod, ViewEntityTypes } from '../views/views.types';
import { ViewsService } from '../views/views.service';
import { PublisherFilterDto, SortBy } from './dtos/publisher-filter.dto';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher) private publisherRepo: Repository<Publisher>,
    private authService: AuthService,
    private booksService: BooksService,
    private blogsService: BlogsService,
    private viewsService: ViewsService
  ) {}

  async signup(
    {
      publisherName,
      slug,
      description,
      logoUrl,
      ...userDto
    }: SignupPublisherDto
  ): Promise<Publisher | never> {
    return this.authService.signup(
      userDto,
      [RolesEnum.Publisher],
      async (user: User, manager: EntityManager) => {
        const publisher = manager.create(Publisher, {
          userId: user.id,
          user: user,
          publisherName,
          slug,
          description,
          logoUrl
        });
        return manager.save(Publisher, publisher).catch((error) => {
          dbErrorHandler(error);
          throw error;
        });
      }
    );
  }

  async getAll(
    {
      page,
      limit,
      search,
      sortBy
    }: PublisherFilterDto
  ): Promise<(Publisher & { bookCount: number })[]> {
    const skip = (page - 1) * limit;
    const qb = this.publisherRepo
      .createQueryBuilder('publisher')
      .leftJoin('publisher.books', 'books')
      .select(['publisher', 'COUNT(books.id) as bookCount'])
      .groupBy('publisher.id');

    // Search filter
    if (search) {
      qb.andWhere(
        '(LOWER(publisher.publisherName) LIKE LOWER(:search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    this.buildOrderBy(qb, sortBy);

    const publishers = await qb
      .skip(skip)
      .limit(limit)
      .getRawAndEntities();
    return publishers.entities.map((publisher, index) => ({
      ...publisher,
      bookCount: parseInt(publishers.raw[index].bookCount, 10),
    }));
  }

  private buildOrderBy(
    qb: SelectQueryBuilder<Publisher>,
    sortBy: SortBy = SortBy.Newest
  ): void {
    switch (sortBy) {
      case SortBy.NameAsc:
        qb.orderBy('publisher.publisherName', 'ASC');
        break;
      case SortBy.NameDesc:
        qb.orderBy('publisher.publisherName', 'DESC');
        break;
      case SortBy.MostBooks:
        qb.orderBy('bookCount', 'DESC');
        break;
      case SortBy.MostView:
        qb.orderBy('publisher.views', 'DESC');
        break;
      case SortBy.Newest:
      default:
        qb.orderBy('publisher.createdAt', 'DESC');
        break;
    }
  }

  async get(
    identifier: { id?: string; slug?: string },
    page: number = 1,
    limit: number = 10,
    complete = false,
  ): Promise<Publisher | never> {
    const where: FindOptionsWhere<Publisher> = {};
    if (identifier.id) {
      where.id = identifier.id;
    } else if (identifier.slug) {
      where.slug = identifier.slug;
    } else {
      throw new BadRequestException('Either id or slug must be provided.');
    }

    const publisher = await this.publisherRepo.findOneOrFail({
      where
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Publisher);
      }
      throw error;
    });

    let books: Book[] = [];
    if (complete) {
      books = await this.booksService.getAll({
        publisherId: publisher.id,
        page,
        limit
      });
    }

    return {
      ...publisher,
      books
    };
  }

  async getTrending(
    period: TrendingPeriod,
    limit?: number
  ): Promise<Publisher[]> {
    const trendingData = await this.viewsService.getTrendingEntities(
      ViewEntityTypes.Publisher,
      period,
      limit
    );

    if (!trendingData || trendingData.length === 0) {
      return [];
    }

    const publisherIds = trendingData.map(item => item.entityId);
    const publishers = await this.publisherRepo.find({
      where: {
        id: In(publisherIds)
      },
    });

    const entityMap = new Map(publishers.map(entity => [entity.id, entity]));
    return trendingData.map(t => (
      entityMap.get(t.entityId)
    ))
    .filter(e => e !== undefined);
  }

  async update(id: string, publisherDto: UpdatePublisherDto): Promise<Publisher | never> {
    const publisher = await this.get({ id });
    Object.assign(publisher, publisherDto);
    return this.publisherRepo.save(publisher).catch((error) => {
      if (error.code === DBErrors.Conflict) {
        throw new ConflictException(ConflictMessages.PublisherName);
      }
      throw error;
    });
  }

  async createBook(
    userId: string,
    {
      publisherId: _,
      ...bookDto
    }: CreateBookDto
  ) {
    const { id: publisherId } = await this.publisherRepo.findOneOrFail({
      where: { userId },
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Publisher);
      }
      throw error;
    });

    return this.booksService.create(
      {
        publisherId,
        ...bookDto
      },
      userId
    );
  }

  async createBlog(
    userId: string,
    {
      publisherId: _,
      ...blogDto
    }: CreateBlogDto
  ) {
    const { id: publisherId } = await this.publisherRepo.findOneOrFail({
      where: { userId },
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Publisher);
      }
      throw error;
    });

    return this.blogsService.create(
      {
        publisherId,
        ...blogDto
      },
      userId
    );
  }

  async updateBlog(
    blogId: string,
    userId: string,
    {
      publisherId: _,
      ...blogDto
    }: UpdateBlogDto
  ) {
    const { id: publisherId } = await this.publisherRepo.findOneOrFail({
      where: { userId },
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Publisher);
      }
      throw error;
    });

    const blog = await this.blogsService.getById(blogId);
    if (blog.publisherId !== publisherId) {
      throw new BadRequestException(BadRequestMessages.CannotUpdateBlog);
    }

    return this.blogsService.update(blogId, blogDto, userId);
  }
}
