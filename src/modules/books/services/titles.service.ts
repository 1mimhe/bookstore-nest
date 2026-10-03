import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Title } from '../entities/title.entity';
import { DataSource, EntityManager, EntityNotFoundError, In, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateTitleDto } from '../dtos/create-title.dto';
import { Author } from '../../authors/author.entity';
import { BadRequestMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateTitleDto } from '../dtos/update-title.dto';
import { Tag } from '../../tags/entities/tag.entity';
import { Character } from '../entities/characters.entity';
import { CreateCharacterDto } from '../dtos/create-character.dto';
import { UpdateCharacterDto } from '../dtos/update-character.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventNames } from 'src/common/enums/event.names';
import { TitleCreatedEvent } from 'src/common/events/catalog/title-created.event';
import { TitleUpdatedEvent } from 'src/common/events/catalog/title-updated.event';
import { TagsService } from '../../tags/tags.service';
import { BookQueryDto, BookSortBy } from '../dtos/book-query.dto';
import { getDateRange } from 'src/common/utilities/decade.utils';
import { Book } from '../entities/book.entity';
import { ViewsService } from '../../views/views.service';
import { TrendingPeriod, ViewEntityTypes } from '../../views/views.types';

@Injectable()
export class TitlesService {
  constructor(
    @InjectRepository(Title) private titleRepo: Repository<Title>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    private tagsService: TagsService,
    private viewsService: ViewsService
  ) {}

  async create(
    {
      authorIds,
      tags,
      features = [],
      quotes = [],
      characterIds,
      ...titleDto
    }: CreateTitleDto,
    userId: string,
    staffId?: string
  ): Promise<Title | never> {
    return this.dataSource.transaction(async (manager) => {
      const authors = await manager.findBy(Author, {
        id: In(authorIds),
      });

      if (authors.length !== authorIds.length) {
        throw new NotFoundException(NotFoundMessages.SomeAuthors);
      }

      let characters: Character[] | undefined;
      if (characterIds && characterIds.length > 0) {
        characters = await manager.findBy(Character, {
          id: In(characterIds)
        })
      }

      let dbTags: Tag[] | undefined;
      if (tags && tags.length > 0) {
        dbTags = await this.tagsService.getOrCreateTags(tags, manager);
      }

      const title = manager.create(Title, {
        ...titleDto,
        authors,
        features,
        quotes,
        tags: dbTags,
        characters,
      });

      const dbTitle = await manager.save(Title, title);

      if (userId) {
        this.eventEmitter.emit(
          EventNames.TitleCreated,
          new TitleCreatedEvent(dbTitle.id, dbTitle.name, userId, staffId),
        );
      }

      return dbTitle;
    }).catch((error) => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async update(
    id: string,
    {
      authorIds,
      tags,
      features,
      quotes,
      characterIds,
      ...titleDto
    }: UpdateTitleDto,
    userId: string,
    staffId?: string
  ): Promise<Title | never> {
    return this.dataSource.transaction(async (manager) => {
      const existingTitle = await manager.findOne(Title, {
        where: { id },
        relations: {
          authors: true,
          tags: true
        }
      });

      if (!existingTitle) {
        throw new NotFoundException(NotFoundMessages.Title);
      }

      let newCharacters: Character[] | undefined;      
      if (characterIds && characterIds.length > 0) {
        newCharacters = await manager.findBy(Character, {
          id: In(characterIds),
        });
      }

      let authors = existingTitle.authors;      
      if (authorIds && authorIds.length > 0) {
        const foundAuthors = await manager.findBy(Author, {
          id: In(authorIds),
        });

        if (foundAuthors.length !== authorIds.length) {
          throw new NotFoundException(NotFoundMessages.SomeAuthors);
        }

        authors = foundAuthors;
      }

      let newTags: Tag[] | undefined;
      if (tags && tags.length > 0) {
        newTags = await this.tagsService.getOrCreateTags(tags, manager);
      }

      const updatedTitle = manager.merge(
        Title,
        existingTitle,
        {
          ...titleDto,
          features: features ?? existingTitle.features,
          quotes: quotes ?? existingTitle.quotes
        }
      ) as Title;

      updatedTitle.authors = authors;
      updatedTitle.tags = [...(existingTitle.tags || []), ...(newTags || [])];
      updatedTitle.characters = [...(existingTitle.characters || []), ...(newCharacters || [])];

      const dbTitle = await manager.save(Title, updatedTitle);

      if (userId) {
        this.eventEmitter.emit(
          EventNames.TitleUpdated,
          new TitleUpdatedEvent(dbTitle.id, Object.keys(titleDto), userId, staffId),
        );
      }
      
      return dbTitle;
    }).catch((error) => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async setDefaultBook(
    titleId: string,
    bookId: string,
    userId: string,
    staffId?: string
  ): Promise<Title | never> {
    const existingTitle = await this.titleRepo.findOneOrFail({
      where: { id: titleId }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Title);
      }
      throw error;
    });

    const book = await this.bookRepo.findOneOrFail({
      where: { id: bookId }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Book);
      }
      throw error;
    });

    if (book.titleId !== titleId) {
      throw new BadRequestException(BadRequestMessages.CannotSetDefaultBook);
    }

    return this.dataSource.transaction(async manager => {
      existingTitle.defaultBookId = bookId;
      const dbTitle = await manager.save(Title, existingTitle);

      if (userId) {
        this.eventEmitter.emit(
          EventNames.TitleUpdated,
          new TitleUpdatedEvent(existingTitle.id, ['defaultBookId'], userId, staffId),
        );
      }

      return dbTitle;
    });
  }

  async getAll({
    page = 1,
    limit = 12,
    search,
    authorId,
    publisherId,
    tags = [],
    decades = [],
    sortBy,
  }: BookQueryDto = {}): Promise<Title[]> {
    const skip = (page - 1) * limit;
    const qb = this.titleRepo
      .createQueryBuilder('title')
      .leftJoinAndSelect('title.authors', 'authors')
      .leftJoinAndSelect('title.tags', 'tags')
      .leftJoinAndSelect('title.defaultBook', 'defaultBook')
      .leftJoinAndSelect('defaultBook.images', 'images')
      .leftJoinAndSelect('defaultBook.publisher', 'defaultPublisher')
      .leftJoinAndSelect('title.books', 'books')
      .leftJoinAndSelect('books.publisher', 'bookPublisher');

    if (search) {
      qb.andWhere(
        '(LOWER(title.name) LIKE LOWER(:search) OR LOWER(title.summary) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (authorId) {
      qb.andWhere(
        '(authors.id = :authorId OR books.id IN (SELECT b2.id FROM books b2 INNER JOIN book_translators bt ON bt.bookId = b2.id WHERE bt.authorId = :authorId))',
        { authorId },
      );
    }

    if (publisherId) {
      qb.andWhere('books.publisherId = :publisherId', { publisherId });
    }

    if (tags && tags.length > 0) {
      this.buildTagsConditions(qb, tags);
    }

    if (decades && decades.length > 0) {
      this.buildDecadeConditions(qb, decades);
    }

    this.buildOrderBy(qb, sortBy);

    return qb.skip(skip).take(limit).getMany();
  }

  async getAllByTag(
    tagSlug: string,
    {
      page = 1,
      limit = 10,
      tags: optionalTags = [],
      decades = [],
      sortBy
    }: BookQueryDto
  ): Promise<Title[]> {
    if (!tagSlug) {
      return [];
    }

    const skip = (page - 1) * limit;
    const qb = this.titleRepo.createQueryBuilder('title')
        .leftJoinAndSelect('title.tags', 'tags')
        .leftJoin('title.books', 'book')
        .where(
          qb => {
            const sq = qb
              .subQuery()
              .select('1')
              .from('title_tag', 'tt1')
              .innerJoin('tags', 't1', 'tt1.tagId = t1.id')
              .where('tt1.titleId = title.id')
              .andWhere('t1.slug = :requiredTag')
              .getQuery();
            
            return `EXISTS (${sq})`;
          }
        )
        .setParameter('requiredTag', tagSlug)
        .leftJoinAndSelect('title.defaultBook', 'defaultBook')
        .leftJoinAndSelect('defaultBook.images', 'images')

    // Add additional tags filtering
    if (optionalTags.length > 0) {
      this.buildTagsConditions(qb, optionalTags);
    }

    // Add decades filtering
    if (decades.length > 0) {
      this.buildDecadeConditions(qb, decades);
    }

    // Sorting based on 
    this.buildOrderBy(qb, sortBy);

    return qb
      .skip(skip)
      .take(limit)
      .getMany();
  }

  async getBySlug(slug: string): Promise<Title | never> {
    return this.titleRepo.findOneOrFail({
      where: { slug },
      relations: {
        authors: true,
        tags: true,
        characters: true,
        books: {
          publisher: true,
          translators: true,
          language: true,
          images: true
        },
      }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Title);
      }
      throw error;
    });
  }

  async getByCharacterId(
    id: string,
    page = 1,
    limit = 10,
    manager?: EntityManager
  ): Promise<Title[]> {
    const repository = manager ? manager.getRepository(Title) : this.titleRepo;
    const skip = (page - 1) * limit;

    return repository.find({
      where: {
        characters: { id },
        defaultBook: {
          images: true
        }
      },
      skip,
      take: limit,
    });
  }

  async getSimilarTitles(
    titleId: string,
    limit: number = 10
  ): Promise<Title[]> {
    return this.titleRepo
      .createQueryBuilder('title')
      .leftJoinAndSelect('title.authors', 'authors')
      .leftJoinAndSelect('title.defaultBook', 'defaultBook')
      .addSelect(
        `(
          SELECT COUNT(*)
          FROM title_tag tt1
          INNER JOIN title_tag tt2 ON tt1.tagId = tt2.tagId
          WHERE tt1.titleId = :titleId
          AND tt2.titleId = title.id
          AND tt1.titleId != tt2.titleId
        )`,
        'commonTagsCount'
      )
      .where('title.id != :titleId')
      .setParameter('titleId', titleId)
      .having('commonTagsCount > 0')
      .orderBy('commonTagsCount', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getTrending(
    period: TrendingPeriod,
    limit?: number
  ): Promise<Title[]> {
    const trendingData = await this.viewsService.getTrendingEntities(
      ViewEntityTypes.Title,
      period,
      limit
    );

    if (!trendingData || trendingData.length === 0) {
      return [];
    }

    const titleIds = trendingData.map(item => item.entityId);
    const titles = await this.titleRepo.find({
      where: {
        id: In(titleIds)
      },
      relations: {
        defaultBook: {
          images: true
        }
      }
    });

    const entityMap = new Map(titles.map(entity => [entity.id, entity]));
    return trendingData.map(t => (
      entityMap.get(t.entityId)
    ))
    .filter(e => e !== undefined);
  }

  async deleteTagFromTitle(titleId: string, tagId: string): Promise<void> {
    return this.titleRepo
      .createQueryBuilder()
      .relation(Title, 'tags')
      .of(titleId)
      .remove(tagId);
  }

  async deleteCharacterFromTitle(titleId: string, characterId: string): Promise<void> {
    return this.titleRepo
      .createQueryBuilder()
      .relation(Title, 'characters')
      .of(titleId)
      .remove(characterId);
  }

  async createCharacter(
    characterDto: CreateCharacterDto,
    userId: string,
    staffId?: string
  ): Promise<Character | never> {
    return this.dataSource.transaction(async manager => {
      const character = manager.create(Character, characterDto);
      const dbCharacter = await manager.save(Character, character);

      if (userId) {
        this.eventEmitter.emit(EventNames.CharacterCreated, {
          characterId: dbCharacter.id,
          name: dbCharacter.fullName,
          userId,
          staffId,
        });
      }

      return dbCharacter;
    });
  }

  async getCharacter(
    identifier: { id?: string; slug?: string },
    page: number = 1,
    limit: number = 10,
    complete?: boolean,
    manager?: EntityManager
  ): Promise<Character | never> {
    const qb = (manager ? manager.getRepository(Character) : this.characterRepo)
      .createQueryBuilder('character');

    if (identifier.id) {
      qb.where('character.id = :id', { id: identifier.id });
    } else if (identifier.slug) {
      qb.where('character.slug = :slug', { slug: identifier.slug });
    }

    if (complete) {
      const skip = (page - 1) * limit;
      qb.leftJoinAndSelect('character.titles', 'titles')
        .leftJoinAndSelect('titles.defaultBook', 'defaultBook')
        .leftJoinAndSelect('defaultBook.images', 'images')
        .skip(skip)
        .take(limit);
    }

    const character = await qb.getOne();
    if (!character) {
      throw new NotFoundException(NotFoundMessages.Character);
    }

    return character;
  }

  async updateCharacter(
    id: string,
    characterDto: UpdateCharacterDto,
    userId: string,
    staffId?: string
  ): Promise<Character | never> {
    return this.dataSource.transaction(async manager => {
      const character = await this.getCharacter({ id }, 0, 0, false, manager);
      Object.assign(character, characterDto);

      const dbCharacter = await manager.save(character);

      if (userId) {
        this.eventEmitter.emit(EventNames.CharacterUpdated, {
          characterId: dbCharacter.id,
          userId,
          staffId,
        });
      }

      return dbCharacter;
    }).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }

  // Helper method for query building
  buildTagsConditions(
    qb: SelectQueryBuilder<Title | Book>,
    tags: string[] = []
  ): void {
    qb.andWhere(
      qb => {
        const subQuery2 = qb
          .subQuery()
          .select('1')
          .from('title_tag', 'tt2')
          .innerJoin('tags', 't2', 'tt2.tagId = t2.id')
          .where('tt2.titleId = title.id')
          .andWhere('t2.slug IN (:...tags)')
          .getQuery();
        return `EXISTS (${subQuery2})`;
      }
    )
    .setParameter('tags', tags);
  }

  // Helper method for query building
  buildDecadeConditions(
    qb: SelectQueryBuilder<Title | Book>, 
    decades: string[]
  ): void {
    if (!decades || decades.length === 0) {
      return;
    }

    const decadeConditions: string[] = [];
    
    decades.forEach((decade, index) => {
      try {
        const { startDate, endDate } = getDateRange(decade);
        const startParam = `decadeStart${index}`;
        const endParam = `decadeEnd${index}`;
        
        decadeConditions.push(`(title.originallyPublishedAt >= :${startParam} AND title.originallyPublishedAt <= :${endParam})`);
        
        // Set parameters
        qb.setParameter(startParam, startDate);
        qb.setParameter(endParam, endDate);
      } catch (error) {
        console.warn(`Invalid decade format: ${decade}`, error);
      }
    });
    
    if (decadeConditions.length > 0) {
      qb.andWhere(`(${decadeConditions.join(' OR ')})`);
    }
  }

  private buildOrderBy(
    qb: SelectQueryBuilder<Title>,
    by: BookSortBy = BookSortBy.Newest
  ): void {
    switch (by) {
      case BookSortBy.MostLiked: {
        const sq = this.titleRepo.createQueryBuilder('sub_title')
          .select('SUM(sub_book.rateCount) + SUM(sub_book.bookmarkCount)', 'totalLikedCount')
          .leftJoin('sub_title.books', 'sub_book')
          .where('sub_title.id = title.id')
          .getQuery();
          qb.addSelect(`(${sq})`, 'titleLikedCount');
          qb.orderBy('titleLikedCount', 'DESC');
        break;
      }
      case BookSortBy.MostSale: {
        const soldSubQuery = this.titleRepo.createQueryBuilder('sub_title')
          .select('SUM(sub_book.sold)', 'totalSold')
          .leftJoin('sub_title.books', 'sub_book')
          .where('sub_title.id = title.id')
          .getQuery();
        qb.addSelect(`(${soldSubQuery})`, 'title_sold');
        qb.orderBy('title_sold', 'DESC')
        break;
      }
      case BookSortBy.MostViews:
        qb.orderBy('title.views', 'DESC');
        break;
      case BookSortBy.Newest:
      default:
        qb.orderBy('title.createdAt', 'DESC');
    }
  }
}
