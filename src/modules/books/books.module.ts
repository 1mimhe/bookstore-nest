import { MiddlewareConsumer, Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { TitlesController } from './titles.controller';
import { CharactersController } from './characters.controller';
import { BookmarksController } from './bookmarks.controller';
import { LanguagesService } from '../languages/languages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TitlesService } from './titles.service';
import { Title } from './entities/title.entity';
import { Author } from '../authors/author.entity';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { BookImage } from './entities/book-image.entity';
import { Language } from '../languages/language.entity';
import { Character } from './entities/characters.entity';
import { Bookmark } from './entities/bookmark.entity';
import { CurrentUserMiddleware } from '../../common/current-user.middleware';
import { UsersModule } from '../users/users.module';
import { TokenModule } from '../token/token.module';
import { TagsModule } from '../tags/tags.module';
import { ViewsModule } from '../views/views.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Language,
      Title,
      Author,
      Book,
      BookImage,
      Character,
      Bookmark
    ]),
    UsersModule,
    TokenModule,
    TagsModule,
    ViewsModule
  ],
  controllers: [
    BooksController,
    TitlesController,
    CharactersController,
    BookmarksController,
  ],
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
