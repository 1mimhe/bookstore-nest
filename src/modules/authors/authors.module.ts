import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './author.entity';
import { BooksModule } from '../books/books.module';
import { TokenModule } from '../token/token.module';
import { StaffModule } from '../staffs/staffs.module';
import { ViewsModule } from '../views/views.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Author]),
    BooksModule,
    TokenModule,
    StaffModule,
    ViewsModule
  ],
  providers: [AuthorsService],
  controllers: [AuthorsController]
})
export class AuthorsModule {}
