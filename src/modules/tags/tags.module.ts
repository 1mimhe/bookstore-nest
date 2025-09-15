import { forwardRef, Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { BooksModule } from '../books/books.module';
import { TokenModule } from '../token/token.module';
import { StaffModule } from '../staffs/staffs.module';
import { Title } from '../books/entities/title.entity';
import { RootTag } from './entities/root-tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tag,
      Title,
      RootTag
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
