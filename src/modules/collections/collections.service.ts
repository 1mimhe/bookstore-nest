import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CollectionBook } from './entities/collection-book.entity';
import { Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CreateCollectionDto } from './dtos/create-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection) private collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionBook) private collectionBookRepo: Repository<CollectionBook>
  ) {}

  async create(collectionRepo: CreateCollectionDto) {
    const collection =  this.collectionRepo.create(collectionRepo);
    return this.collectionRepo.save(collection);
  }
}
