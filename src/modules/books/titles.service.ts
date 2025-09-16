import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Title } from './entities/title.entity';
import { DataSource, EntityManager, EntityNotFoundError, FindOptionsWhere, In, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateTitleDto } from './dtos/create-title.dto';
import { Author } from '../authors/author.entity';
import { BadRequestMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateTitleDto } from './dtos/update-title.dto';
import { Tag } from '../tags/entities/tag.entity';
import { Character } from './entities/characters.entity';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { UpdateCharacterDto } from './dtos/update-character.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { StaffsService } from '../staffs/staffs.service';
import { EntityTypes, StaffActionTypes } from '../staffs/entities/staff-action.entity';
import { TagsService } from '../tags/tags.service';
import { BookFilterDto, SortBy } from './dtos/book-filter.dto';
import { getDateRange } from 'src/common/utilities/decade.utils';
import { Book } from './entities/book.entity';
import { ViewsService } from '../views/views.service';
import { TrendingPeriod, ViewEntityTypes } from '../views/views.types';

@Injectable()
export class TitlesService {
  constructor(
    @InjectRepository(Title) private titleRepo: Repository<Title>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    private dataSource: DataSource,
    private staffsService: StaffsService,
    @Inject(forwardRef(() => TagsService)) private tagsService:  TagsService,
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
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.TitleCreated,
            entityId: dbTitle.id,
            entityType: EntityTypes.Title,
            newValue: JSON.stringify(dbTitle)
          },
          manager
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
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.TitleUpdated,
            entityId: dbTitle.id,
            entityType: EntityTypes.Title,
            oldValue: JSON.stringify(existingTitle),
            newValue: JSON.stringify(dbTitle)
          },
          manager
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
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.TitleUpdated,
            entityId: existingTitle.id,
            entityType: EntityTypes.Title,
            oldValue: JSON.stringify(existingTitle),
            newValue: JSON.stringify(dbTitle)
          },
          manager
        );
      }

      return dbTitle;
    });
  }

  async getAllByTag(
    tagSlug: string,
    {
      page = 1,
      limit = 10,
      tags: optionalTags = [],
      decades = [],
      sortBy
    }: BookFilterDto
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
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.CharacterCreated,
            entityId: dbCharacter.id,
            entityType: EntityTypes.Character,
            newValue: JSON.stringify(dbCharacter)
          },
          manager
        );
      }

      return dbCharacter;
    });
  }

  async getCharacter(
    identifier: { id?: string; slug?: string },
    page: number = 1,
    limit: number = 10,
    complete = false,
    manager?: EntityManager
  ): Promise<Character | never> {
    const repository = manager ? manager.getRepository(Character) : this.characterRepo;

    const where: FindOptionsWhere<Character> = {};
    if (identifier.id) {
      where.id = identifier.id;
    } else if (identifier.slug) {
      where.slug = identifier.slug;
    } else {
      throw new BadRequestException('Either id or slug must be provided.');
    }

    const character = await repository.findOneOrFail({
      where
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Character);
      }
      throw error;
    });

    let titles: Title[] = [];
    if (complete) {
      titles = await this.getByCharacterId(character.id, page, limit, manager);
    }

    return {
      ...character,
      titles
    };
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
        await this.staffsService.createAction(
          {
            userId,
            staffId,
            type: StaffActionTypes.CharacterUpdated,
            entityId: dbCharacter.id,
            entityType: EntityTypes.Character,
            oldValue: JSON.stringify(character),
            newValue: JSON.stringify(dbCharacter)
          },
          manager
        );
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

  buildOrderBy(qb: SelectQueryBuilder<Book>, by?: SortBy): void;
  buildOrderBy(qb: SelectQueryBuilder<Title>, by?: SortBy): void;
  buildOrderBy(qb: SelectQueryBuilder<Book | Title>, by: SortBy = SortBy.Newest): void {
    const entityType = qb.expressionMap.mainAlias?.metadata?.targetName;

    if (entityType === 'Book') {
      switch (by) {
        case SortBy.MostLiked:
          qb.orderBy('book.rateCount', 'DESC');
          break;
        case SortBy.MostView:
          qb.orderBy('title.views', 'DESC');
          break;
        case SortBy.MostSale:
          qb.orderBy('book.sold', 'DESC');
          break;
        default:
          qb.orderBy('book.createdAt', 'DESC');
      }
    } else if (entityType === 'Title') {
      switch (by) {
        case SortBy.MostLiked:
          const rateCountSubQuery = this.titleRepo.createQueryBuilder('sub_title')
            .select('SUM(sub_book.rateCount)', 'totalRateCount')
            .leftJoin('sub_title.books', 'sub_book')
            .where('sub_title.id = title.id')
            .getQuery();
            qb.addSelect(`(${rateCountSubQuery})`, 'title_rateCount');
            qb.orderBy('title_rateCount', 'DESC');
          break;
        case SortBy.MostSale:
          const soldSubQuery = this.titleRepo.createQueryBuilder('sub_title')
            .select('SUM(sub_book.sold)', 'totalSold')
            .leftJoin('sub_title.books', 'sub_book')
            .where('sub_title.id = title.id')
            .getQuery();
          qb.addSelect(`(${soldSubQuery})`, 'title_sold');
          qb.orderBy('title_sold', 'DESC')
          break;
        case SortBy.MostView:
          qb.orderBy('title.views', 'DESC');
          break;
        default:
          qb.orderBy('title.createdAt', 'DESC');
      }
    }
  }
}
