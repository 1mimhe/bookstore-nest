import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLanguageDto } from '../books/dtos/create-language.dto';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { DBErrors } from 'src/common/enums/db.errors';
import { Language } from './language.entity';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language) private languageRepo: Repository<Language>
  ) {}

  async create(languageDto: CreateLanguageDto): Promise<Language | never> {
    const language = this.languageRepo.create(languageDto);
    return this.languageRepo.save(language).catch((error) => {
      if (error.code === DBErrors.Conflict) {
        throw new ConflictException(ConflictMessages.Language);
      }
      throw error;
    });
  }

  async getAll(): Promise<Language[]> {
    return this.languageRepo.find();
  }
}
