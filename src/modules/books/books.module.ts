import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { LanguagesService } from './languages.service';

@Module({
  controllers: [BooksController],
  providers: [LanguagesService]
})
export class BooksModule {}
