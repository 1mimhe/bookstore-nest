import { Body, Controller, Post } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateCollectionDto } from './dtos/create-collection.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @ApiOperation({
    summary: 'Create an empty collection'
  })
  @Post()
  async createCollection(@Body() body: CreateCollectionDto) {
    return this.collectionsService.create(body);
  }
}
