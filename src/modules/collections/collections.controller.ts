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
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
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
import { ViewsService } from '../views/views.service';
import { TrendingPeriod, ViewEntityTypes } from '../views/views.types';
import { Request, Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CollectionQueryDto } from './dtos/collection-query.dto';

@Controller('collections')
@ApiTags('Collection')
export class CollectionsController {
  constructor(
    private collectionsService: CollectionsService,
    private viewsService: ViewsService
  ) {}

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
    description: 'With pagination, different filtering, search and sorting.'
  })
  @ApiQueryPagination()
  @Serialize(CollectionCompactResponseDto)
  @Get()
  async getAllCollections(
    @Query() query: CollectionQueryDto
  ): Promise<CollectionCompactResponseDto[]> {
    return this.collectionsService.getAll(query);
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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('complete', new ParseBoolPipe({ optional: true }))
    complete?: boolean,
    @CurrentUser('id') userId?: string
  ): Promise<CollectionResponseDto> {
    const collection = await this.collectionsService.get({ slug }, complete);

    await this.viewsService.recordView(
      ViewEntityTypes.Collection,
      collection.id,
      req,
      res,
      userId
    );

    return collection;
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
    summary: 'Retrieves trending collections',
  })
  @Serialize(CollectionCompactResponseDto)
  @Get('trending/:period')
  async getTrendingTitles(
    @Param('period', new ParseEnumPipe(TrendingPeriod)) period: TrendingPeriod,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20
  ): Promise<CollectionCompactResponseDto[]> {
    return this.collectionsService.getTrending(period, limit);
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
