import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CollectionBook } from './entities/collection-book.entity';
import { DataSource, EntityNotFoundError, Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { CreateCollectionBookDto } from './dtos/create-collection-book.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateCollectionBookDto } from './dtos/update-collection-book.dto';

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

  async getCollectionBook(id: string) {
    return this.collectionBookRepo.findOneOrFail({
      where: { id }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.CollectionBook);
      }
      throw error;
    });
  }

  async updateCollectionBook(id: string, cbDto: UpdateCollectionBookDto) {
    const cb = await this.getCollectionBook(id);
    Object.assign(cb, cbDto);
    return this.collectionBookRepo.save(cb).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async reorderCollectionBooks(collectionId: string, cbIds: string[]) {
    const count = await this.collectionBookRepo
      .createQueryBuilder('cb')
      .where("cb.collectionId = :collectionId", { collectionId })
      .where('cb.id IN (:...cbIds)', { cbIds })
      .getCount();

    if (count !== cbIds.length) {
      throw new NotFoundException(NotFoundMessages.SomeCollectionBooks);
    }

    let caseStatement = 'CASE ';    
    cbIds.forEach((id, index) => {
      caseStatement += `WHEN id = '${id}' THEN ${index + 1} `;
    });
    caseStatement += 'ELSE `order` END';

    return this.collectionBookRepo
      .createQueryBuilder('cb')
      .select('cb.id', 'cb.order')
      .update(CollectionBook)
      .set({ order: () => caseStatement })
      .where('id IN (:...cbIds)', { cbIds })
      .execute();
  }
}
