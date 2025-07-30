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
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { CreateCollectionBookDto } from './dtos/create-collection-book.dto';
import { UpdateCollectionBookDto } from './dtos/update-collection-book.dto';
import { UuidArrayDto } from './entities/uuid-array.dto';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { ApiQueryComplete, ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { CollectionBookCompactResponseDto, CollectionCompactResponseDto, CollectionResponseDto } from './dtos/collection-response.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @ApiOperation({
    summary: 'Create an empty collection',
  })
  @Serialize(CollectionCompactResponseDto)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createCollection(
    @Body() body: CreateCollectionDto
  ): Promise<CollectionCompactResponseDto> {
    return this.collectionsService.create(body);
  }

  @ApiOperation({
    summary: 'Retrieves all collections',
  })
  @ApiQueryPagination()
  @Serialize(CollectionCompactResponseDto)
  @Get()
  async getAllCollection(
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
    @Param('slug', ParseUUIDPipe) slug: string,
    @Query('complete', new ParseBoolPipe({ optional: true }))
    complete?: boolean,
  ): Promise<CollectionResponseDto> {
    return this.collectionsService.get({ slug }, complete);
  }

  @ApiOperation({
    summary: 'Add a book to a collection',
  })
  @HttpCode(HttpStatus.CREATED)
  @Serialize(CollectionBookCompactResponseDto)
  @Post(':id/books')
  async createCollectionBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateCollectionBookDto,
  ): Promise<CollectionBookCompactResponseDto> {
    return this.collectionsService.createCollectionBook(id, body);
  }

  @ApiOperation({
    summary: 'Update a collection book by its id',
    description: 'Id is a collection book id, not book id.'
  })
  @Serialize(CollectionBookCompactResponseDto)
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
  @Patch(':id/books/reorder')
  async reorderCollectionBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UuidArrayDto,
  ) {
    return this.collectionsService.reorderCollectionBooks(id, body.ids);
  }

  @ApiOperation({
    summary: 'Delete a book from a collection',
    description: 'Id is a collection book id, not book id.'
  })
  @Serialize(CollectionBookCompactResponseDto)
  @Delete('books/:id')
  async deleteCollectionBook(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CollectionBookCompactResponseDto> {
    return this.collectionsService.deleteCollectionBooks(id);
  }
}
