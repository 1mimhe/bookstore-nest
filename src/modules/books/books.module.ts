import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { LanguagesService } from './languages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { TitlesService } from './titles.service';
import { Title } from './entities/title.entity';
import { Author } from '../authors/entities/author.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Language, Title, Author])],
  controllers: [BooksController],
  providers: [LanguagesService, TitlesService]
})
export class BooksModule {}
