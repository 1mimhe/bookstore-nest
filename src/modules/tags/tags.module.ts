import { forwardRef, Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './tag.entity';
import { BooksModule } from '../books/books.module';
import { TokenModule } from '../token/token.module';
import { StaffModule } from '../staffs/staffs.module';
import { Title } from '../books/entities/title.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tag,
      Title
    ]),
    TokenModule,
    StaffModule,
    forwardRef(() => BooksModule),
  ],
  providers: [TagsService],
  controllers: [TagsController],
  exports: [TagsService]
})
export class TagsModule {}
