import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { ConflictMessages } from 'src/common/enums/conflict.messages';
import { NotFoundMessages } from 'src/common/enums/not-found.messages';
import { UpdateAuthorDto } from './dtos/update-author.dto';
import { DBErrors } from 'src/common/enums/db.errors';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author) private authorRepo: Repository<Author>
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

  async getBySlug(slug: string): Promise<Author | never> {
    return this.authorRepo.findOneOrFail({
      where: { slug }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Author);
      }
      throw error;
    });
  }

  async getAll(): Promise<Author[]> {
    return this.authorRepo.find();
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
