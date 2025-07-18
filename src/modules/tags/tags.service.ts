import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { DBErrors } from 'src/common/enums/db.errors';
import { CreateTagDto } from './dtos/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(@InjectRepository(Tag) private tagRepo: Repository<Tag>) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepo.create(createTagDto);
    return await this.tagRepo.save(tag).catch((error) => {
      if (error.code === DBErrors.Conflict) {
        throw new ConflictException(ConflictMessages.Tag);
      }
      throw error;
    });
  }
}
