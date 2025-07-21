import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Tag, TagType } from './tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConflictMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { DBErrors } from 'src/common/enums/db.errors';
import { CreateTagDto } from './dtos/create-tag.dto';
import { TitlesService } from '../books/titles.service';
import { UpdateTagDto } from './dtos/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    private titlesService: TitlesService
  ) {}

  async create(tagDto: CreateTagDto): Promise<Tag | never> {    
    const tag = this.tagRepo.create(tagDto);
    return await this.tagRepo.save(tag).catch((error) => {
      if (error.code === DBErrors.Conflict) {
        throw new ConflictException(ConflictMessages.Tag);
      }
      throw error;
    });
  }

  async getAll(type?: TagType): Promise<Tag[]> {
    return this.tagRepo.find({ where: { type } });
  }

  async getById(id: string): Promise<Tag | never> {
    return this.tagRepo.findOneOrFail({
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

  async update(id: string, tagDto: UpdateTagDto): Promise<Tag | never> {
    const tag = await this.getById(id);
    Object.assign(tag, tagDto);
    return await this.tagRepo.save(tag).catch((error) => {
      if (error.code === DBErrors.Conflict) {
        throw new ConflictException(ConflictMessages.Tag);
      }
      throw error;
    });
  }
}
