import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
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
import { ApiQueryComplete } from 'src/common/decorators/query.decorators';

@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @ApiOperation({
    summary: 'Create an empty collection',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createCollection(@Body() body: CreateCollectionDto) {
    return this.collectionsService.create(body);
  }

  @ApiOperation({
    summary: 'Retrieves a collection by its id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Collection,
  })
  @ApiQueryComplete('collections')
  @Get('id/:id')
  async getCollectionById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('complete', new ParseBoolPipe({ optional: true }))
    complete?: boolean,
  ) {
    return this.collectionsService.get({ id }, complete);
  }

  @ApiOperation({
    summary: 'Retrieves a collection by its slug',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Collection,
  })
  @ApiQueryComplete('collections')
  @Get('slug/:slug')
  async getCollectionBySlug(
    @Param('slug', ParseUUIDPipe) slug: string,
    @Query('complete', new ParseBoolPipe({ optional: true }))
    complete?: boolean,
  ) {
    return this.collectionsService.get({ slug }, complete);
  }

  @ApiOperation({
    summary: 'Add a book to a collection',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/books')
  async createCollectionBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateCollectionBookDto,
  ) {
    return this.collectionsService.createCollectionBook(id, body);
  }

  @ApiOperation({
    summary: 'Update a collection book by its id',
  })
  @HttpCode(HttpStatus.CREATED)
  @Patch('books/:id')
  async updateCollectionBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCollectionBookDto,
  ) {
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
}
