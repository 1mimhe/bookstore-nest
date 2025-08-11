import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { CollectionBook } from './entities/collection-book.entity';
import { TokenModule } from '../token/token.module';
import { StaffModule } from '../staffs/staffs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collection,
      CollectionBook
    ]),
    TokenModule,
    StaffModule
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService]
})
export class CollectionsModule {}
