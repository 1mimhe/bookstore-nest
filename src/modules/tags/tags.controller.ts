import { Body, Controller, DefaultValuePipe, Get, Param, ParseEnumPipe, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dtos/create-tag.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TagType } from './entities/tag.entity';
import { UpdateTagDto } from './dtos/update-tag.dto';
import { ApiQueryPagination } from 'src/common/decorators/query.decoretors';

@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @ApiOperation({
    summary: 'Create a new tag',
    description: `Create a new tag for books and articles,... categorization.\n
      **Tag types:\n
      - thematic_category => e.g. Fiction Literature, Self Development,
      Psychology, Philosophy, Short Story, Drama Literature, History, Politics\n
      - story_type => e.g. Romance, Philosophical, Historical, Fantasy, Mystery,
      Crime, Science Fiction, Psychological, Horror Stories\n
      - featured_books => e.g. 1001 Novels, NY Times Bestsellers, Best Self-Development,
      Le Monde's 100 Books, Guardian Best, etc.\n
      - literature_award => e.g. Nobel Literature, Man Booker, Pulitzer Fiction, Goncourt Prize, etc.\n
      - nation_literature => e.g. Iranian, American, French, Japanese, Russian, German, English, Canadian Literature\n
      - system_tags => e.g. Festival Sales, Recommended Books, Bestsellers, New Releases, Signed Editions, etc.\n
    `
  })
  @Post()
  async createTag(@Body() body: CreateTagDto) {
    return this.tagsService.create(body);
  }

  @ApiOperation({
    summary: 'Retrieves all tags'
  })
  @ApiQuery({
    name: 'type',
    enum: TagType,
    required: false,
    description: 'The type of tags to retrieve (optional).',
  })
  @Get()
  async getAllTags(
    @Query('type', new ParseEnumPipe(TagType, { optional: true })) type?: TagType
  ) {
    return this.tagsService.getAll(type);
  }

  @ApiOperation({
    summary: 'Retrieves a tag by name with its relations'
  })
  @ApiQueryPagination()
  @Get(':name')
  async getTagByName(
    @Param('name') name: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.tagsService.getBySlug(name, page, limit);
  }

  @ApiOperation({
    summary: 'Update a tag by id',
  })
  @Patch(':id')
  async updateTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTagDto
  ) {
    return this.tagsService.update(id, body);
  }

}
