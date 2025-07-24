import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Title } from './entities/title.entity';
import { DataSource, EntityNotFoundError, FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateTitleDto } from './dtos/create-title.dto';
import { DBErrors } from 'src/common/enums/db.errors';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { Author } from '../authors/author.entity';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateTitleDto } from './dtos/update-title.dto';
import { Tag } from '../tags/tag.entity';
import { Quote } from './entities/quote.entity';
import { Feature } from './entities/feature.entity';
import { Character } from './entities/characters.entity';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { UpdateCharacterDto } from './dtos/update-character.dto';

@Injectable()
export class TitlesService {
  constructor(
    @InjectRepository(Title) private titleRepo: Repository<Title>,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    private dataSource: DataSource,
  ) {}

  async create({
    authorIds,
    tags,
    features = [],
    quotes = [],
    ...titleDto
  }: CreateTitleDto): Promise<Title | never> {
    return this.dataSource.transaction(async (manager) => {
      const authors = await manager.findBy(Author, {
        id: In(authorIds),
      });

      if (authors.length !== authorIds.length) {
        throw new NotFoundException(NotFoundMessages.SomeAuthors);
      }

      let dbTags: Tag[] | undefined;
      if (tags && tags.length > 0) {
        dbTags = await manager.findBy(Tag, {
          name: In(tags),
        });
      }

      const title = manager.create(Title, {
        ...titleDto,
        authors,
        features: features.map((feature => ({ feature }))),
        quotes: quotes.map((quote => ({ quote }))),
        tags: dbTags,
      });

      return manager.save(Title, title).catch((error) => {
        if (error.code === DBErrors.Conflict) {
          throw new ConflictException(ConflictMessages.Slug);
        }
        throw error;
      });
    });
  }

  async update(
    id: string,
    {
      authorIds,
      tags,
      features,
      quotes,
      ...titleDto
    }: UpdateTitleDto,
  ): Promise<Title | never> {
    return this.dataSource.transaction(async (manager) => {
      const existingTitle = await manager.findOne(Title, {
        where: { id },
        relations: ['authors', 'tags', 'features', 'quotes'],
      });

      if (!existingTitle) {
        throw new NotFoundException(NotFoundMessages.Title);
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

      if (features) {
        await manager.delete(Feature, { titleId: existingTitle.id });
        existingTitle.features = [];
      }

      if (quotes) {
        await manager.delete(Quote, { titleId: existingTitle.id });
        existingTitle.quotes = [];
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
          features: features?.map((feature) => ({ feature })),
          quotes: quotes?.map((quote) => ({ quote }))
        }
      ) as Title;

      updatedTitle.authors = authors;
      updatedTitle.tags = [...(existingTitle.tags || []), ...(newTags || [])];

      return manager.save(Title, updatedTitle).catch((error) => {
        if (error.code === DBErrors.Conflict) {
          throw new ConflictException(ConflictMessages.Slug);
        }
        throw error;
      });
    });
  }

  async getAllByTag(tagSlug: string, page = 1, limit = 10): Promise<Title[]> {
    const skip = (page - 1) * limit;
    return this.titleRepo.find({
      where: {
        tags: {
          slug: tagSlug,
        },
      },
      skip,
      take: limit,
    });
  }

  async getBySlug(slug: string): Promise<Title | never> {
    return this.titleRepo.findOneOrFail({
      where: { slug },
      relations: ['authors', 'tags', 'features', 'quotes', 'books',
        'books.publisher', 'books.translators', 'books.language', 'books.images'],
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Title);
      }
      throw error;
    });
  }

  async getByCharacterId(id: string, page = 1, limit = 10): Promise<Title[]> {
    const skip = (page - 1) * limit;
    return this.titleRepo.find({
      where: {
        characters: { id }
      },
      skip,
      take: limit,
    });
  }

  async createCharacter(characterDto: CreateCharacterDto): Promise<Character | never> {
    const character = this.characterRepo.create(characterDto);
    return this.characterRepo.save(character);
  }

  async getCharacter(
    identifier: { id?: string; slug?: string },
    page: number = 1,
    limit: number = 10,
    complete = false,
  ): Promise<Character | never> {
    const where: FindOptionsWhere<Character> = {};
    if (identifier.id) {
      where.id = identifier.id;
    } else if (identifier.slug) {
      where.slug = identifier.slug;
    } else {
      throw new BadRequestException('Either id or slug must be provided.');
    }

    const character = await this.characterRepo.findOneOrFail({
      where
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Character);
      }
      throw error;
    });

    let titles: Title[] = [];
    if (complete) {
      titles = await this.getByCharacterId(character.id, page, limit);
    }

    return {
      ...character,
      titles
    };
  }
}
