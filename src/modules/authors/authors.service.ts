import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { Repository } from 'typeorm';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { CommonMessages } from 'src/common/enums/common.messages';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author) private authorRepo: Repository<Author>
  ) {}

  async create(authorDto: CreateAuthorDto) {
    const author = this.authorRepo.create(authorDto);
    return this.authorRepo.save(author).catch((error) => {
      if (error.code === '23505') {
        throw new BadRequestException(CommonMessages.SlugAlreadyExists);
      }
      throw error;
    });
  }
}
