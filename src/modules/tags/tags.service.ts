import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { makeSlug } from 'src/common/utilities/make-unique';
import { BookFilterDto } from '../books/dtos/book-filter.dto';
import { RootTag } from './entities/root-tag.entity';
import { CreateRootTagDto } from './dtos/create-root-tag.dto';

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
          slug: makeSlug(tagName)
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

  async createRootTag(
    {
      tagId,
      topic
    }: CreateRootTagDto
  ): Promise<RootTag> {
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
      topic
    });

    return this.rootTagRepo.save(newRootTag).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async deleteRootTag(tagId: string): Promise<void> {
    const rootTag = await this.rootTagRepo.findOne({ where: { tagId } });
    if (!rootTag) {
      throw new NotFoundException(`RootTag with tag id ${tagId} not found.`);
    }

    const deletedOrder = rootTag.order;

    await this.rootTagRepo.delete({ tagId });

    await this.reorderRootTagsAfterDeletion(deletedOrder);
  }

  private async reorderRootTagsAfterDeletion(deletedOrder: number): Promise<void> {
    const rootTagsToUpdate = await this.rootTagRepo
      .createQueryBuilder('rootTag')
      .andWhere('rootTag.order > :deletedOrder', { deletedOrder })
      .orderBy('rootTag.order', 'ASC')
      .getMany();

    for (const rt of rootTagsToUpdate) {
      rt.order--;
      await this.rootTagRepo.save(rt);
    }
  }

  async reorderRootTags(newOrderList: { tagId: string; order: number }[]): Promise<RootTag[]> {
    const updatedRootTags: RootTag[] = [];

    const existingRootTags = await this.rootTagRepo.find({});
    const existingIds = new Set(existingRootTags.map(rt => rt.tagId));
    const newOrderIds = new Set(newOrderList.map(item => item.tagId));

    if (existingIds.size !== newOrderIds.size || !Array.from(newOrderIds).every(id => existingIds.has(id))) {
        throw new BadRequestException('The provided list of IDs does not match the existing RootTags.');
    }

    // Check for duplicate orders
    const orderSet = new Set(newOrderList.map(item => item.order));
    if (orderSet.size !== newOrderList.length) {
      throw new BadRequestException('New order list contains duplicate order numbers.');
    }

    await this.rootTagRepo.manager.transaction(async (transactionalEntityManager) => {
      for (const item of newOrderList) {
        const rootTag = existingRootTags.find(rt => rt.tagId === item.tagId);
        if (rootTag) {
          rootTag.order = item.order;
          await transactionalEntityManager.save(rootTag);
          updatedRootTags.push(rootTag);
        } else {
          throw new NotFoundException(`RootTag with tag id ${item.tagId} not found.`);
        }
      }
    });

    return updatedRootTags.sort((a, b) => a.order - b.order);
  }

  async getAllRootTags(): Promise<RootTag[]> {
    const qb = this.rootTagRepo.createQueryBuilder('rootTag')
      .leftJoinAndSelect('rootTag.tag', 'tag')
      .leftJoinAndSelect('tag.titles', 'titles')
      .leftJoinAndSelect('titles.defaultBook', 'defaultBook')
      .leftJoinAndSelect('defaultBook.images', 'images');

    // Rank titles by views within each tag.
    const rankSubQuery = qb.subQuery()
      .select('t.id', 't_id')
      .from('titles', 't')
      .leftJoin('t.tags', 'tags')
      .addSelect('ROW_NUMBER() OVER (PARTITION BY tags.id ORDER BY t.views DESC)', 'rn')
      .getQuery();

    qb.innerJoin(
      '(' + rankSubQuery + ')',
      'ranked_titles',
      'ranked_titles.t_id = titles.id AND ranked_titles.rn <= 10'
    )
      .where('rootTag.deletedAt IS NULL')
      .orderBy('rootTag.order', 'ASC')
      .addOrderBy('titles.views', 'DESC');

    return qb.getMany();
  }
}
