import { Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dtos/create-language.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { TitlesService } from './titles.service';
import { CreateTitleDto } from './dtos/create-title.dto';
import { ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { CreateBookDto } from './dtos/create-book.dto';
import { BooksService } from './books.service';
import { UpdateBookDto } from './dtos/update-book.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

@Controller('books')
export class BooksController {
  constructor(
    private languagesService: LanguagesService,
    private titlesService: TitlesService,
    private booksService: BooksService
  ) {}

  @ApiOperation({
    summary: 'Create a language',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.Language
  })
  @Post('languages')
  async createLanguage(@Body() body: CreateLanguageDto) {
    return this.languagesService.create(body);
  }

  @ApiOperation({
    summary: 'Retrieves all languages',
  })
  @Get('languages')
  async getAllLanguages() {
    return this.languagesService.getAll();
  }

  @ApiOperation({
    summary: 'Create a title',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.SomeAuthors
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.Slug
  })
  @Post('titles')
  async createTitle(@Body() body: CreateTitleDto) {
    return this.titlesService.create(body);
  }

  @ApiOperation({
    summary: 'Update a title',
    description: 'It override authors if included.'
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.SomeAuthors
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Title
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.Slug
  })
  @Patch('titles/:id')
  async updateTitle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateTitleDto
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
    description: NotFoundMessages.Language
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.SomeAuthors
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Publisher
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Title
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.ISBN
  })
  @Post()
  async createBook(@Body() body: CreateBookDto) {
    return this.booksService.create(body);
  }

  @ApiOperation({
    summary: 'Update a book',
    description: 'It override translators and merge book images if included.'
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Language
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.SomeAuthors
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Publisher
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Title
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.ISBN
  })
  @Patch(':id')
  async updateBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBookDto
  ) {
    return this.booksService.update(id, body);
  }

  @ApiOperation({
    summary: 'Delete a book image by id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.BookImage
  })
  @Delete('images/:id')
  async deleteBookImage(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.deleteImage(id);
  }
}
