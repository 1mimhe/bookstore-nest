import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { LanguagesService } from './languages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Language])],
  controllers: [BooksController],
  providers: [LanguagesService]
})
export class BooksModule {}
