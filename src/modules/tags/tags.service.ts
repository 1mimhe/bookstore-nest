import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, EntityNotFoundError, Repository } from 'typeorm';
import { Tag, TagType } from './tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConflictMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { DBErrors } from 'src/common/enums/db.errors';
import { CreateTagDto } from './dtos/create-tag.dto';
import { TitlesService } from '../books/titles.service';
import { UpdateTagDto } from './dtos/update-tag.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { StaffsService } from '../staffs/staffs.service';
import { EntityTypes, StaffActionTypes } from '../staffs/entities/staff-action.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    private dataSource: DataSource,
    private titlesService: TitlesService,
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
    });;
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

  // TODO
  async getBySlug(slug: string, page = 1, limit = 10): Promise<Tag | never> {
    const tag = await this.tagRepo.findOneOrFail({
      where: { slug },
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Tag);
      }
      throw error;
    });

    const titles = await this.titlesService.getAllByTag(slug, page, limit);

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
}
