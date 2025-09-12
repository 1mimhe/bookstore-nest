import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Publisher } from './publisher.entity';
import { EntityManager, EntityNotFoundError, FindOptionsWhere, Repository } from 'typeorm';
import { RolesEnum } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { SignupPublisherDto } from './dtos/create-publisher.dto';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdatePublisherDto } from './dtos/update-publisher.dto';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { DBErrors } from 'src/common/enums/db.errors';
import { AuthService } from '../auth/auth.service';
import { BooksService } from '../books/books.service';
import { Book } from '../books/entities/book.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { CreateBookDto } from '../books/dtos/create-book.dto';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher) private publisherRepo: Repository<Publisher>,
    private authService: AuthService,
    private booksService: BooksService
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

  async getAll(page = 1, limit = 10): Promise<(Publisher & { bookCount: number })[]> {
    const skip = (page - 1) * limit;
    const publishers = await this.publisherRepo
      .createQueryBuilder('author')
      .leftJoin('publisher.books', 'books')
      .select(['publisher', 'COUNT(books.id) as bookCount'])
      .groupBy('publisher.id')
      .skip(skip)
      .limit(limit)
      .getRawAndEntities();

    return publishers.entities.map((author, index) => ({
      ...author,
      bookCount: parseInt(publishers.raw[index].bookCount, 10),
    }));
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
      books = await this.booksService.getByPublisherId(publisher.id, { page, limit });
    }

    return {
      ...publisher,
      books
    };
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

    return this.booksService.create({
      publisherId,
      ...bookDto
    });
  }
}
