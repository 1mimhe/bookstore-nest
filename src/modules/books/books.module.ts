import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { LanguagesService } from './languages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { TitlesService } from './titles/titles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Language])],
  controllers: [BooksController],
  providers: [LanguagesService, TitlesService]
})
export class BooksModule {}
