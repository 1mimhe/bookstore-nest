import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { Repository } from 'typeorm';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { CommonMessages } from 'src/common/enums/common.messages';
import { NotFoundMessages } from 'src/common/enums/not-found.messages';
import { UpdateAuthorDto } from './dtos/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author) private authorRepo: Repository<Author>
  ) {}

  async create(authorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepo.create(authorDto);
    return this.authorRepo.save(author).catch((error) => {
      if (error.code === '23505') {
        throw new BadRequestException(CommonMessages.SlugAlreadyExists);
      }
      throw error;
    });
  }

  async getById(id: string): Promise<Author> {
    const author = await this.authorRepo.findOne({
      where: { id }
    });
    
    if (!author) {
      throw new NotFoundException(NotFoundMessages.Author);
    }
    
    return author;
  }

  async getBySlug(slug: string): Promise<Author> {
    const author = await this.authorRepo.findOne({
      where: { slug }
    });
    
    if (!author) {
      throw new NotFoundException(NotFoundMessages.Author);
    }
    
    return author;
  }

  async getAll(): Promise<Author[]> {
    return this.authorRepo.find();
  }

  async update(id: string, authorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.getById(id);
    Object.assign(author, authorDto);
    return this.authorRepo.save(author).catch((error) => {
      if (error.code === '23505') {
        throw new BadRequestException(CommonMessages.SlugAlreadyExists);
      }
      throw error;
    });
  }

  async delete(id: string): Promise<Author> {
    const profile = await this.getById(id);
    return this.authorRepo.softRemove(profile);
  }
}
