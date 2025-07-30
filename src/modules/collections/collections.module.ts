import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { CollectionBook } from './entities/collection-book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collection, CollectionBook])
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService]
})
export class CollectionsModule {}
