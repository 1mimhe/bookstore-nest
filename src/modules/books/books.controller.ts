import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiOkResponse,
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
import { ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { BookResponseDto, ImageResponseDto } from './dtos/book-response.dto';
import { TitleCompactResponseDto, TitleResponseDto } from './dtos/title-response.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UpdateTitleDto } from './dtos/update-title.dto';
import { CreateCharacterDto } from './dtos/create-character.dto';

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
    description: NotFoundMessages.SomeAuthors,
  })
  @ApiConflictResponse({
    description: ConflictMessages.Slug,
  })
  @Serialize(TitleCompactResponseDto)
  @HttpCode(HttpStatus.CREATED)
  @Post('titles')
  async createTitle(
    @Body() body: CreateTitleDto
  ): Promise<TitleCompactResponseDto> {
    return this.titlesService.create(body);
  }

  @ApiOperation({
    summary: 'Retrieves a complete title by its slug',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Title,
  })
  @ApiOkResponse({
    type: TitleResponseDto
  })
  @Serialize(TitleResponseDto)
  @Get('titles/:slug')
  async getTitleBySlug(
    @Param('slug') slug: string
  ) {
    return this.titlesService.getBySlug(slug);
  }

  @ApiOperation({
    summary: 'Retrieves all books by its publisher id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiQueryPagination()
  // Serialize for arrays?
  @Get('publisher/:id')
  async getBooksByPublisherId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<BookResponseDto[]> {
    return this.booksService.getByPublisherId(id, page, limit);
  }

  @ApiOperation({
    summary: 'Retrieves all books by its author and translator id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiQueryPagination()
  @Serialize(BookResponseDto)
  @Get('author/:id')
  async getBooksByAuthorId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<BookResponseDto[]> {
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
    description: NotFoundMessages.SomeAuthors,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Title,
  })
  @ApiConflictResponse({
    description: ConflictMessages.Slug,
  })
  @Serialize(TitleCompactResponseDto)
  @Patch('titles/:id')
  async updateTitle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTitleDto,
  ): Promise<TitleCompactResponseDto> {
    return this.titlesService.update(id, body);
  }

  @ApiOperation({
    summary: 'Create a book',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Language,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.SomeAuthors,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Title,
  })
  @ApiConflictResponse({
    description: ConflictMessages.ISBN,
  })
  @Serialize(BookResponseDto)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBook(
    @Body() body: CreateBookDto
  ): Promise<BookResponseDto> {
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
    description: NotFoundMessages.Language,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.SomeAuthors,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Title,
  })
  @ApiConflictResponse({
    description: ConflictMessages.ISBN,
  })
  @Serialize(BookResponseDto)
  @Patch(':id')
  async updateBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBookDto,
  ): Promise<BookResponseDto> {
    return this.booksService.update(id, body);
  }

  @ApiOperation({
    summary: 'Delete a book image by id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.BookImage,
  })
  @Serialize(ImageResponseDto)
  @Delete('images/:id')
  async deleteBookImage(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ImageResponseDto> {
    return this.booksService.deleteImage(id);
  }

  @ApiOperation({
    summary: 'Create a book character',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('characters')
  async createBookCharacter(@Body() body: CreateCharacterDto) {
    return this.titlesService.createCharacter(body);
  }
}
