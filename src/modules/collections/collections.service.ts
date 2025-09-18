import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CollectionBook } from './entities/collection-book.entity';
import { DataSource, EntityManager, EntityNotFoundError, FindOptionsRelations, FindOptionsWhere, In, Repository, SelectQueryBuilder } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { CreateCollectionBookDto } from './dtos/create-collection-book.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateCollectionBookDto } from './dtos/update-collection-book.dto';
import { StaffsService } from '../staffs/staffs.service';
import { EntityTypes, StaffActionTypes } from '../staffs/entities/staff-action.entity';
import { TrendingPeriod, ViewEntityTypes } from '../views/views.types';
import { ViewsService } from '../views/views.service';
import { CollectionFilterDto, SortBy } from './dtos/collection-filter.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection) private collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionBook) private collectionBookRepo: Repository<CollectionBook>,
    private dataSource: DataSource,
    private staffsService: StaffsService,
    private viewsService: ViewsService
  ) {}

  async create(
    collectionRepo: CreateCollectionDto,
    userId: string,
    staffId?: string
  ): Promise<Collection | never> {
    return this.dataSource.transaction(async manager => {
      const collection =  manager.create(Collection, collectionRepo);
      const dbCollection = await manager.save(Collection, collection);

      if (userId) {
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.CollectionCreated,
            entityId: dbCollection.id,
            entityType: EntityTypes.Collection,
            newValue: JSON.stringify(dbCollection)
          },
          manager
        );
      }

      return dbCollection;
    }).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async getAll(
    {
      page = 1,
      limit = 10,
      search,
      sortBy
    }: CollectionFilterDto
  ): Promise<(Collection & { bookCount: number })[]> {
    const skip = (page - 1) * limit;
    const qb = this.collectionRepo
      .createQueryBuilder('collection')
      .leftJoin('collection.collectionBooks', 'collectionBooks')
      .select(['collection', 'COUNT(collectionBooks.id) as bookCount'])
      .groupBy('collection.id');

    // Search filter
    if (search) {
      qb.andWhere(
        '(LOWER(collection.name) LIKE LOWER(:search) OR ' +
        '(LOWER(collection.slug) LIKE LOWER(:search) OR ' +
        'LOWER(collection.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    // Sorting
    this.buildOrderBy(qb, sortBy);

    const collections = await qb
      .skip(skip)
      .limit(limit)
      .getRawAndEntities();
    
    return collections.entities.map((collection, index) => ({
      ...collection,
      bookCount: parseInt(collections.raw[index].bookCount, 10),
    }));
  }

  private buildOrderBy(
    qb: SelectQueryBuilder<Collection>,
    sortBy: SortBy = SortBy.Newest
  ): void {
    switch (sortBy) {
      case SortBy.NameAsc:
        qb.orderBy('collection.name', 'ASC');
        break;
      case SortBy.NameDesc:
        qb.orderBy('collection.name', 'DESC');
        break;
      case SortBy.MostBooks:
        qb.orderBy('bookCount', 'DESC');
        break;
      case SortBy.MostView:
        qb.orderBy('collection.views', 'DESC');
        break;
      case SortBy.Newest:
      default:
        qb.orderBy('collection.createdAt', 'DESC');
        break;
    }
  }

  async get(
    identifier: { id?: string; slug?: string },
    complete = true,
    manager?: EntityManager
  ): Promise<Collection | never> {
    const where: FindOptionsWhere<Collection> = {};
    if (identifier.id) {
      where.id = identifier.id;
    } else if (identifier.slug) {
      where.slug = identifier.slug;
    } else {
      throw new BadRequestException('Either id or slug must be provided.');
    }
    
    const repository = manager ? manager.getRepository(Collection) : this.collectionRepo;
    const relations = complete ? {
      collectionBooks: {
        book: true
      }
    } as FindOptionsRelations<Collection> : {};
  
    return repository.findOneOrFail({
      where,
      relations,
      order: {
        collectionBooks: {
          order: 'ASC'
        }
      }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Collection);
      }
      throw error;
    });
  }

  async getTrending(
    period: TrendingPeriod,
    limit?: number
  ): Promise<Collection[]> {
    const trendingData = await this.viewsService.getTrendingEntities(
      ViewEntityTypes.Collection,
      period,
      limit
    );

    if (!trendingData || trendingData.length === 0) {
      return [];
    }

    const collectionIds = trendingData.map(item => item.entityId);
    const collections = await this.collectionRepo.find({
      where: {
        id: In(collectionIds)
      }
    });

    const entityMap = new Map(collections.map(entity => [entity.id, entity]));
    return trendingData.map(t => (
      entityMap.get(t.entityId)
    ))
    .filter(e => e !== undefined);
  }

  async createCollectionBook(
    collectionId: string,
    cbDto: CreateCollectionBookDto,
    userId: string,
    staffId?: string
  ): Promise<CollectionBook | never> {
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
      const dbCB = await manager.save(CollectionBook, cb);

      if (userId) {
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.CollectionUpdated,
            entityId: dbCB.id,
            entityType: EntityTypes.Collection,
            newValue: JSON.stringify(dbCB)
          },
          manager
        );
      }

      return dbCB;
    }).catch((error: Error) => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async getCollectionBook(id: string): Promise<CollectionBook | never> {
    return this.collectionBookRepo.findOneOrFail({
      where: { id }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.CollectionBook);
      }
      throw error;
    });
  }

  async getCollectionsByTitleId(
    titleId: string,
    page = 1,
    limit = 10
  ): Promise<Collection[]> {
    const skip = (page - 1) * limit;
    return this.collectionRepo.find({
      where: {
        collectionBooks: {
          book: {
            titleId
          }
        }
      },
      skip,
      take: limit,
    });
  }

  async updateCollectionBook(
    id: string, cbDto: UpdateCollectionBookDto
  ): Promise<CollectionBook | never> {
    const cb = await this.getCollectionBook(id);
    Object.assign(cb, cbDto);
    return this.collectionBookRepo.save(cb).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async reorderCollectionBooks(
    collectionId: string, cbIds: string[]
  ): Promise<{ affected?: number } | never> {
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

  async deleteCollectionBooks(id: string): Promise<CollectionBook | never> {
    const cb = await this.getCollectionBook(id);
    return this.collectionBookRepo.remove(cb);
  }
}
