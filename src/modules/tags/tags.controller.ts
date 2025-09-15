import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dtos/create-tag.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TagType } from './entities/tag.entity';
import { UpdateTagDto } from './dtos/update-tag.dto';
import { ApiQueryArray, ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { TagCompactResponseDto, TagResponseDto } from './dtos/tag-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { RolesEnum } from '../users/entities/role.entity';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { SessionData } from 'express-session';
import { BookFilterDto } from '../books/dtos/book-filter.dto';
import { ReorderRootTagsDto } from './dtos/reorder-root-tags.dto';
import { CreateRootTagDto } from './dtos/create-root-tag.dto';

@Controller('tags')
@ApiTags('Tag')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @ApiOperation({
    summary: 'Create a new tag',
    description: `Create a new tag for titles and blogs,... categorization.\n
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
    `,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createTag(
    @Body() body: CreateTagDto,
    @Session() session: SessionData
  ): Promise<TagCompactResponseDto> {
    return this.tagsService.create(body, session.staffId);
  }

  @ApiOperation({
    summary: 'Retrieves all tags',
  })
  @ApiQuery({
    name: 'type',
    enum: TagType,
    required: false,
    description: 'The type of tags to retrieve (optional).',
  })
  @Serialize(TagCompactResponseDto)
  @Get()
  async getAllTags(
    @Query('type', new ParseEnumPipe(TagType, { optional: true }))
    type?: TagType,
  ): Promise<TagCompactResponseDto[]> {
    return this.tagsService.getAll(type);
  }

  @ApiOperation({
    summary: 'Get all root tags'
  })
  @Get('root')
  async getAllRootTags() {
    return this.tagsService.getAllRootTags();
  }

  @ApiOperation({
    summary: 'Retrieves a tag by slug with its relations',
  })
  @ApiQueryPagination()
  @ApiQueryArray('tags', String, 'Other tags to filter')
  @Serialize(TagResponseDto)
  @Get(':slug')
  async getTagByName(
    @Param('slug') slug: string,
    @Query() query: BookFilterDto
  ): Promise<TagResponseDto> {
    return this.tagsService.getBySlug(slug, query);
  }

  @ApiOperation({
    summary: 'Update a tag by id',
  })
  @ApiBearerAuth()
  @Serialize(TagResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Patch(':id')
  async updateTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTagDto,
    @Session() session: SessionData
  ): Promise<TagCompactResponseDto> {
    return this.tagsService.update(id, body, session.staffId);
  }

  @ApiOperation({
    summary: 'Create a root tag',
    description: `This is useful for curating lists of important tags that need a specific
      display order.`
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @HttpCode(HttpStatus.CREATED)
  @Post('root')
  async createRootTag(
    @Body() body: CreateRootTagDto
  ) {
    return this.tagsService.createRootTag(body);
  }

  @ApiOperation({
    summary: 'Deletes a root tag by tag id',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Delete(':id/root')
  async deleteRootTag(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagsService.deleteRootTag(id);
  }

  @ApiOperation({
    summary: 'Reorder root tags'
  })
  @ApiBadRequestResponse({
    description: 'Bad request (e.g., invalid ID list, duplicate orders).'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Put('root/reorder')
  async reorderRootTags(
    @Body() reorderDto: ReorderRootTagsDto,
  ) {
    return this.tagsService.reorderRootTags(reorderDto.newRootTagsOrders);
  }
}
