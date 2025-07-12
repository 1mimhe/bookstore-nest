import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { Repository } from 'typeorm';
import { CreateLanguageDto } from './dtos/create-language.dto';
import { ConflictMessages } from 'src/common/enums/conflict.messages';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language) private languageRepo: Repository<Language>
  ) {}

  async create(languageDto: CreateLanguageDto): Promise<Language | never> {
    const language = this.languageRepo.create(languageDto);
    return this.languageRepo.save(language).catch((error) => {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(ConflictMessages.Language);
      }
      throw error;
    });
  }

  async getAll(): Promise<Language[]> {
    return this.languageRepo.find();
  }
}
