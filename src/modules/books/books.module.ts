import { MiddlewareConsumer, Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { LanguagesService } from '../languages/languages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TitlesService } from './titles.service';
import { Title } from './entities/title.entity';
import { Author } from '../authors/author.entity';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { BookImage } from './entities/book-image.entity';
import { Language } from '../languages/language.entity';
import { Quote } from './entities/quote.entity';
import { Feature } from './entities/feature.entity';
import { Character } from './entities/characters.entity';
import { Bookmark } from './entities/bookmark.entity';
import { CurrentUserMiddleware } from 'src/common/middlewares/current-user.middleware';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Language,
      Title,
      Author,
      Book,
      BookImage,
      Quote,
      Feature,
      Character,
      Bookmark
    ]),
    UsersModule,
    TokenModule,
  ],
  controllers: [BooksController],
  providers: [LanguagesService, TitlesService, BooksService],
  exports: [
    TitlesService,
    BooksService
  ]
})
export class BooksModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes('books/bookmark');
  }
}
