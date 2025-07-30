import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { CreateCollectionBookDto } from './dtos/create-collection-book.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @ApiOperation({
    summary: 'Create an empty collection'
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createCollection(@Body() body: CreateCollectionDto) {
    return this.collectionsService.create(body);
  }

  @ApiOperation({
    summary: 'Add a book to a collection'
  })
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/books')
  async createCollectionBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateCollectionBookDto 
  ) {
    return this.collectionsService.createCollectionBook(id, body);
  }
}
