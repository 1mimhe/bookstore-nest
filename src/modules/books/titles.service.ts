import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Title } from './entities/title.entity';
import { Between, DataSource, EntityManager, EntityNotFoundError, FindOperator, FindOptionsWhere, In, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateTitleDto } from './dtos/create-title.dto';
import { Author } from '../authors/author.entity';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateTitleDto } from './dtos/update-title.dto';
import { Tag } from '../tags/tag.entity';
import { Character } from './entities/characters.entity';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { UpdateCharacterDto } from './dtos/update-character.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { StaffsService } from '../staffs/staffs.service';
import { EntityTypes, StaffActionTypes } from '../staffs/entities/staff-action.entity';
import { TagsService } from '../tags/tags.service';
import { BookFilterDto } from './dtos/book-filter.dto';
import { getDateRange } from 'src/common/utilities/decade.utils';

@Injectable()
export class TitlesService {
  constructor(
    @InjectRepository(Title) private titleRepo: Repository<Title>,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    private dataSource: DataSource,
    private staffsService: StaffsService,
    @Inject(forwardRef(() => TagsService)) private tagsService:  TagsService,
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

      if (staffId) {
        await this.staffsService.createAction(
          {
            staffId,
            type: StaffActionTypes.TitleCreated,
            entityId: dbTitle.id,
            entityType: EntityTypes.Title
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
    staffId?: string
  ): Promise<Title | never> {
    return this.dataSource.transaction(async (manager) => {
      const existingTitle = await manager.findOne(Title, {
        where: { id },
        relations: ['authors', 'tags', 'features', 'quotes'],
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
        newTags = await manager.findBy(Tag, {
          name: In(tags),
        });
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

      if (staffId) {
        await this.staffsService.createAction(
          {
            staffId,
            type: StaffActionTypes.TitleUpdated,
            entityId: dbTitle.id,
            entityType: EntityTypes.Title
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

  async getAllByTag(
    tagSlug: string,
    {
      page = 1,
      limit = 10,
      tags: optionalTags = [],
      decades = []
    }: BookFilterDto
  ): Promise<Title[]> {
    if (!tagSlug) {
      return [];
    }

    const skip = (page - 1) * limit;
    const qb = this.titleRepo.createQueryBuilder('title')
        .leftJoinAndSelect('title.tags', 'tags')
        .where(
          qb => {
            const subQuery1 = qb
              .subQuery()
              .select('1')
              .from('title_tag', 'tt1')
              .innerJoin('tags', 't1', 'tt1.tagId = t1.id')
              .where('tt1.titleId = title.id')
              .andWhere('t1.slug = :requiredTag')
              .getQuery();
            
            return `EXISTS (${subQuery1})`;
          }
        )
        .setParameter('requiredTag', tagSlug);

    // Add additional tags filtering
    if (optionalTags.length > 0) {
      qb.andWhere(
        qb => {
          const subQuery2 = qb
            .subQuery()
            .select('1')
            .from('title_tag', 'tt2')
            .innerJoin('tags', 't2', 'tt2.tagId = t2.id')
            .where('tt2.titleId = title.id')
            .andWhere('t2.slug IN (:...optionalTags)')
            .getQuery();
          
          return `EXISTS (${subQuery2})`;
        }
      )
      .setParameter('optionalTags', optionalTags);
    }

    // Add decades filtering
    if (decades.length > 0) {
      this.buildDecadeConditions(qb, decades);
    }

    // For multiple tags
    return qb
      .skip(skip)
      .take(limit)
      .getMany();
  }

  async getBySlug(slug: string): Promise<Title | never> {
    return this.titleRepo.findOneOrFail({
      where: { slug },
      relations: ['authors', 'tags', 'characters', 'features', 'quotes', 'books',
        'books.publisher', 'books.translators', 'books.language', 'books.images'],
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
        characters: { id }
      },
      skip,
      take: limit,
    });
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
    staffId?: string
  ): Promise<Character | never> {
    return this.dataSource.transaction(async manager => {
      const character = manager.create(Character, characterDto);
      const dbCharacter = await manager.save(Character, character);

      if (staffId) {
        await this.staffsService.createAction(
          {
            staffId,
            type: StaffActionTypes.CharacterCreated,
            entityId: dbCharacter.id,
            entityType: EntityTypes.Character
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
    staffId?: string
  ): Promise<Character | never> {
    return this.dataSource.transaction(async manager => {
      const character = await this.getCharacter({ id }, 0, 0, false, manager);
      Object.assign(character, characterDto);

      const dbCharacter = await manager.save(character);

      if (staffId) {
        await this.staffsService.createAction(
          {
            staffId,
            type: StaffActionTypes.CharacterUpdated,
            entityId: dbCharacter.id,
            entityType: EntityTypes.Character
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

  // Helper method
  private buildDecadeConditions(
    qb: SelectQueryBuilder<Title>, 
    decades: string[]
  ): void{
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
}
