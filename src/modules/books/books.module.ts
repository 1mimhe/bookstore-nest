import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
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
import { Character } from './entities/characters.entity';
import { Bookmark } from './entities/bookmark.entity';
import { CurrentUserMiddleware } from '../../common/current-user.middleware';
import { UsersModule } from '../users/users.module';
import { TokenModule } from '../token/token.module';
import { StaffModule } from '../staffs/staffs.module';
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
    StaffModule,
    forwardRef(() => TagsModule),
    ViewsModule
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
