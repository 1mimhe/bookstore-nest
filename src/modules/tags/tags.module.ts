import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './tag.entity';
import { BooksModule } from '../books/books.module';
import { TokenModule } from '../token/token.module';
import { StaffModule } from '../staffs/staffs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag]),
    BooksModule,
    TokenModule,
    StaffModule
  ],
  providers: [TagsService],
  controllers: [TagsController]
})
export class TagsModule {}
