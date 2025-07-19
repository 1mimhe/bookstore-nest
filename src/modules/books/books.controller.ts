import {
  Body,
  ConflictException,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { TitlesService } from './titles.service';
import { CreateTitleDto } from './dtos/create-title.dto';
import { ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { CreateBookDto } from './dtos/create-book.dto';
import { BooksService } from './books.service';
import { UpdateBookDto } from './dtos/update-book.dto';
import { ApiQueryPagination } from 'src/common/decorators/query.decoretors';

@Controller('books')
export class BooksController {
  constructor(
    private titlesService: TitlesService,
    private booksService: BooksService,
  ) {}

  @ApiOperation({
    summary: 'Create a title',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.SomeAuthors,
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.Slug,
  })
  @Post('titles')
  async createTitle(@Body() body: CreateTitleDto) {
    return this.titlesService.create(body);
  }

  @ApiOperation({
    summary: 'Retrieves a complete title by slug',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Title,
  })
  @Get('titles/:slug')
  async getTitleBySlug(@Param('slug') slug: string) {
    return this.titlesService.getBySlug(slug);
  }

  @ApiOperation({
    summary: 'Retrieves all books by its publisher id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Publisher,
  })
  @ApiQueryPagination()
  @Get('publisher/:id')
  async getBooksByPublisherId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.booksService.getByPublisherId(id, page, limit);
  }

  @ApiOperation({
    summary: 'Retrieves all books by its author and translator id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Publisher,
  })
  @ApiQueryPagination()
  @Get('author/:id')
  async getBooksByAuthorId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.booksService.getByAuthorId(id, page, limit);
  }

  @ApiOperation({
    summary: 'Update a title',
    description: 'It override authors and tags will be merged if included.',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.SomeAuthors,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Title,
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.Slug,
  })
  @Patch('titles/:id')
  async updateTitle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateTitleDto,
  ) {
    return this.titlesService.update(id, body);
  }

  @ApiOperation({
    summary: 'Create a book',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Language,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.SomeAuthors,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Publisher,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Title,
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.ISBN,
  })
  @Post()
  async createBook(@Body() body: CreateBookDto) {
    return this.booksService.create(body);
  }

  @ApiOperation({
    summary: 'Update a book',
    description: 'It override translators and merge book images if included.',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Language,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.SomeAuthors,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Publisher,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Title,
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.ISBN,
  })
  @Patch(':id')
  async updateBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBookDto,
  ) {
    return this.booksService.update(id, body);
  }

  @ApiOperation({
    summary: 'Delete a book image by id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.BookImage,
  })
  @Delete('images/:id')
  async deleteBookImage(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.deleteImage(id);
  }
}
