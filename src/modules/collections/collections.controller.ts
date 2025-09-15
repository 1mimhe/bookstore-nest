import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { CreateCollectionBookDto } from './dtos/create-collection-book.dto';
import { UpdateCollectionBookDto } from './dtos/update-collection-book.dto';
import { UuidArrayDto } from './entities/uuid-array.dto';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import {
  ApiQueryComplete,
  ApiQueryPagination,
} from 'src/common/decorators/query.decorators';
import {
  CollectionBookCompactResponseDto,
  CollectionCompactResponseDto,
  CollectionResponseDto,
} from './dtos/collection-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from '../users/entities/role.entity';
import { SessionData } from 'express-session';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('collections')
@ApiTags('Collection')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @ApiOperation({
    summary: 'Create an empty collection',
  })
  @ApiBearerAuth()
  @Serialize(CollectionCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createCollection(
    @Body() body: CreateCollectionDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<CollectionCompactResponseDto> {
    return this.collectionsService.create(body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Retrieves all collections',
  })
  @ApiQueryPagination()
  @Serialize(CollectionCompactResponseDto)
  @Get()
  async getAllCollections(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<CollectionCompactResponseDto[]> {
    return this.collectionsService.getAll(page, limit);
  }

  @ApiOperation({
    summary: 'Retrieves a collection by its id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Collection,
  })
  @ApiQueryComplete('collections')
  @Serialize(CollectionResponseDto)
  @Get('id/:id')
  async getCollectionById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('complete', new ParseBoolPipe({ optional: true }))
    complete?: boolean,
  ): Promise<CollectionResponseDto> {
    return this.collectionsService.get({ id }, complete);
  }

  @ApiOperation({
    summary: 'Retrieves a collection by its slug',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Collection,
  })
  @ApiQueryComplete('collections')
  @Serialize(CollectionResponseDto)
  @Get('slug/:slug')
  async getCollectionBySlug(
    @Param('slug') slug: string,
    @Query('complete', new ParseBoolPipe({ optional: true }))
    complete?: boolean,
  ): Promise<CollectionResponseDto> {
    return this.collectionsService.get({ slug }, complete);
  }

  @ApiOperation({
    summary: 'Retrieves collections that the title included',
  })
  @ApiQueryPagination()
  @Serialize(CollectionCompactResponseDto)
  @Get('title/:id')
  async getCollectionsByTitleId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<CollectionCompactResponseDto[]> {
    return this.collectionsService.getCollectionsByTitleId(id, page, limit);
  }

  @ApiOperation({
    summary: 'Add a book to a collection',
  })
  @ApiBearerAuth()
  @Serialize(CollectionBookCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/books')
  async createCollectionBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateCollectionBookDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<CollectionBookCompactResponseDto> {
    return this.collectionsService.createCollectionBook(id, body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Update a collection book by its id',
    description: 'Id is a collection book id, not book id.',
  })
  @ApiBearerAuth()
  @Serialize(CollectionBookCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @Patch('books/:id')
  async updateCollectionBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCollectionBookDto,
  ): Promise<CollectionBookCompactResponseDto> {
    return this.collectionsService.updateCollectionBook(id, body);
  }

  @ApiOperation({
    summary: 'Reorder collection books',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @Patch(':id/books/reorder')
  async reorderCollectionBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UuidArrayDto,
  ) {
    return this.collectionsService.reorderCollectionBooks(id, body.ids);
  }

  @ApiOperation({
    summary: 'Delete a book from a collection',
    description: 'Id is a collection book id, not book id.',
  })
  @ApiBearerAuth()
  @Serialize(CollectionBookCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @Delete('books/:id')
  async deleteCollectionBook(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CollectionBookCompactResponseDto> {
    return this.collectionsService.deleteCollectionBooks(id);
  }
}
