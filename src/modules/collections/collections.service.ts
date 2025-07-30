import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CollectionBook } from './entities/collection-book.entity';
import { DataSource, EntityManager, EntityNotFoundError, Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { CreateCollectionBookDto } from './dtos/create-collection-book.dto';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { dbErrorHandler } from 'src/common/utilities/error-handler';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection) private collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionBook) private collectionBookRepo: Repository<CollectionBook>,
    private dataSource: DataSource
  ) {}

  async create(collectionRepo: CreateCollectionDto) {
    const collection =  this.collectionRepo.create(collectionRepo);
    return this.collectionRepo.save(collection);
  }

  async createCollectionBook(
    collectionId: string,
    cbDto: CreateCollectionBookDto
  ) {
    return this.dataSource.transaction(async manager => {
      const result = await manager
        .getRepository(CollectionBook)
        .createQueryBuilder('cb')
        .where("cb.collectionId = :collectionId", { collectionId })
        .select('MAX(cb.order)', 'maxOrder')
        .getRawOne();
      const maxOrder = result?.maxOrder ? parseInt(result.maxOrder) + 1 : 1;
      
      const cb = manager.create(CollectionBook, {
        collectionId,
        ...cbDto,
        order: maxOrder
      });
      return manager.save(CollectionBook, cb);
    }).catch((error: Error) => {
      dbErrorHandler(error);
      throw error;
    });
  }
}
