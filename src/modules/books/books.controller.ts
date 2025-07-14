import { Body, ConflictException, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dtos/create-language.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { ConflictMessages } from 'src/common/enums/conflict.messages';
import { TitlesService } from './titles.service';
import { CreateTitleDto } from './dtos/create-title.dto';
import { ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';
import { NotFoundMessages } from 'src/common/enums/not-found.messages';

@Controller('books')
export class BooksController {
  constructor(
    private languagesService: LanguagesService,
    private titlesService: TitlesService
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
}
