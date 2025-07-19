import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { EntityNotFoundError, FindOptionsWhere, Repository } from 'typeorm';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateAuthorDto } from './dtos/update-author.dto';
import { DBErrors } from 'src/common/enums/db.errors';
import { BooksService } from '../books/books.service';
import { Book } from '../books/entities/book.entity';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author) private authorRepo: Repository<Author>,
    private booksService: BooksService
  ) {}

  async create(authorDto: CreateAuthorDto): Promise<Author | never> {
    const author = this.authorRepo.create(authorDto);
    return this.authorRepo.save(author).catch((error) => {
      if (error.code === DBErrors.Conflict) {
        throw new ConflictException(ConflictMessages.Slug);
      }
      throw error;
    });
  }

  async getById(id: string): Promise<Author | never> {
    return this.authorRepo.findOneOrFail({
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

  async update(id: string, authorDto: UpdateAuthorDto): Promise<Author | never> {
    const author = await this.getById(id);
    Object.assign(author, authorDto);
    return this.authorRepo.save(author).catch((error) => {
      if (error.code === DBErrors.Conflict) {
        throw new ConflictException(ConflictMessages.Slug);
      }
      throw error;
    });
  }

  async delete(id: string): Promise<Author | never> {
    const profile = await this.getById(id);
    return this.authorRepo.softRemove(profile);
  }
}
