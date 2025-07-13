import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Title } from './entities/title.entity';
import { Repository } from 'typeorm';
import { CreateTitleDto } from './dtos/create-title.dto';
import { DBErrors } from 'src/common/enums/db.errors';
import { ConflictMessages } from 'src/common/enums/conflict.messages';

@Injectable()
export class TitlesService {
  constructor(
    @InjectRepository(Title) private titleRepo: Repository<Title>
  ) {}

  async create(titleDto: CreateTitleDto): Promise<Title | never> {
    const title = this.titleRepo.create(titleDto);
    return this.titleRepo.save(title).catch(error => {
      if (error.code === DBErrors.Conflict) {
        throw new ConflictException(ConflictMessages.Title);
      }
      throw error;
    });
  }
}
