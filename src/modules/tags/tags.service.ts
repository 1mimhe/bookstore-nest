import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, EntityNotFoundError, In, Repository } from 'typeorm';
import { Tag, TagType } from './entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { CreateTagDto } from './dtos/create-tag.dto';
import { TitlesService } from '../books/titles.service';
import { UpdateTagDto } from './dtos/update-tag.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { StaffsService } from '../staffs/staffs.service';
import { EntityTypes, StaffActionTypes } from '../staffs/entities/staff-action.entity';
import { makeUnique } from 'src/common/utilities/make-unique';
import { BookFilterDto } from '../books/dtos/book-filter.dto';
import { RootTag } from './entities/root-tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    @InjectRepository(RootTag) private rootTagRepo: Repository<RootTag>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => TitlesService)) private titlesService:  TitlesService,
    private staffsService: StaffsService
  ) {}

  async create(
    tagDto: CreateTagDto,
    staffId?: string
  ): Promise<Tag | never> {
    return this.dataSource.transaction(async manager => {
      const tag = this.tagRepo.create(tagDto);
      const dbTag = await this.tagRepo.save(tag);

      if (staffId) {
        await this.staffsService.createAction(
          {
          staffId,
          type: StaffActionTypes.TagCreated,
          entityId: dbTag.id,
          entityType: EntityTypes.Tag
          },
          manager
        );
      }

      return dbTag;
    }).catch((error) => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async getOrCreateTags(tags: string[], manager: EntityManager): Promise<Tag[]> {
    if (!tags || tags.length === 0) {
      return [];
    }

    const existingTags = await manager.findBy(Tag, {
      name: In(tags),
    });

    const existingTagNames = new Set(existingTags.map(tag => tag.name));
    const tagsToCreate = tags.filter(tagName => !existingTagNames.has(tagName));

    // Create new tags
    let createdTags: Tag[] = [];
    if (tagsToCreate.length > 0) {
      const newTags = tagsToCreate.map(tagName => 
        this.tagRepo.create({
          name: tagName,
          slug: makeUnique(tagName)
        })
      );
      
      createdTags = await manager.save(Tag, newTags);
    }
    
    // Return all tags
    return [...existingTags, ...createdTags];
  }

  async getAll(type?: TagType): Promise<Tag[]> {
    return this.tagRepo.find({ where: { type } });
  }

  async getById(
    id: string,
    manager?: EntityManager
  ): Promise<Tag | never> {
    const repository = manager ? manager.getRepository(Tag) : this.tagRepo;
    return repository.findOneOrFail({
      where: { id }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Tag);
      }
      throw error;
    });
  }

  async getBySlug(
    slug: string,
    filter: BookFilterDto
  ): Promise<Tag | never> {
    const tag = await this.tagRepo.findOneOrFail({
      where: { slug },
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Tag);
      }
      throw error;
    });

    const titles = await this.titlesService.getAllByTag(slug, filter);

    return {
      ...tag,
      titles
    };
  }

  async update(
    id: string,
    tagDto: UpdateTagDto,
    staffId?: string
  ): Promise<Tag | never> {
    return this.dataSource.transaction(async manager => {
      const tag = await this.getById(id);
      Object.assign(tag, tagDto);
      const dbTag = await this.tagRepo.save(tag);

      if (staffId) {
        await this.staffsService.createAction(
          {
          staffId,
          type: StaffActionTypes.TagUpdated,
          entityId: dbTag.id,
          entityType: EntityTypes.Tag
          },
          manager
        );
      }

      return dbTag;
    }).catch((error) => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async createRootTag(tagId: string): Promise<RootTag> {
    const tag = await this.tagRepo.findOne({ where: { id: tagId } });
    if (!tag) {
      throw new NotFoundException(NotFoundMessages.Tag);
    }

    // Find the maximum order
    const maxOrderRootTagOrder = await this.rootTagRepo.maximum('order');
    const newOrder = maxOrderRootTagOrder ? maxOrderRootTagOrder + 1 : 1;

    const newRootTag = this.rootTagRepo.create({
      tag,
      tagId,
      order: newOrder,
    });

    return this.rootTagRepo.save(newRootTag).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }
}
