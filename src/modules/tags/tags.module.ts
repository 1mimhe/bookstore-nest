import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TokenModule } from '../token/token.module';
import { StaffModule } from '../staffs/staffs.module';
import { Title } from '../books/entities/title.entity';
import { RootTag } from './entities/root-tag.entity';
import { ViewsModule } from '../views/views.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tag,
      Title,
      RootTag
    ]),
    TokenModule,
    StaffModule,
    ViewsModule
  ],
  providers: [TagsService],
  controllers: [TagsController],
  exports: [TagsService]
})
export class TagsModule {}
