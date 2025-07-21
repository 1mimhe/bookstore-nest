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
import { CreateAuthorDto } from './dtos/create-author.dto';
import { Author } from './author.entity';
import { AuthorsService } from './authors.service';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UpdateAuthorDto } from './dtos/update-author.dto';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { ConflictMessages } from 'src/common/enums/error.messages';
import {
  ApiQueryComplete,
  ApiQueryPagination,
} from 'src/common/decorators/query.decorators';
import {
  AuthorCompactResponseDto,
  AuthorPlusCountResDto,
  AuthorResponseDto,
} from './dtos/author-response.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

@Controller('authors')
export class AuthorsController {
  constructor(private authorsService: AuthorsService) {}

  @ApiOperation({
    summary: 'Create a new author',
    description:
      'Creates a new author (or translator) with the provided information',
  })
  @ApiConflictResponse({
    description: ConflictMessages.Slug,
  })
  @Serialize(AuthorResponseDto)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createAuthor(
    @Body() body: CreateAuthorDto,
  ): Promise<AuthorResponseDto> {
    return this.authorsService.create(body);
  }

  @ApiOperation({
    summary: 'Retrieves all authors',
  })
  @ApiQueryPagination()
  @Serialize(AuthorPlusCountResDto)
  @Get()
  async getAllAuthors(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<AuthorPlusCountResDto[]> {
    return this.authorsService.getAll(page, limit);
  }

  @ApiOperation({
    summary: 'Retrieves a author by its id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiQueryComplete('books')
  @ApiQueryPagination()
  @Serialize(AuthorResponseDto)
  @Get('id/:id')
  async getPublisherById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('complete', new ParseBoolPipe({ optional: true }))
    complete?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<AuthorResponseDto> {
    return this.authorsService.get({ id }, page, limit, complete);
  }

  @ApiOperation({
    summary: 'Retrieves a author by its slug',
    description: 'Includes relations.',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiQueryComplete('books')
  @ApiQueryPagination()
  @Serialize(AuthorResponseDto)
  @Get('slug/:slug')
  async getPublisherBySlug(
    @Param('slug') slug: string,
    @Query('complete', new ParseBoolPipe({ optional: true }))
    complete?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<AuthorResponseDto> {
    return this.authorsService.get({ slug }, page, limit, complete);
  }

  @ApiOperation({
    summary: 'Update a author',
  })
  @ApiConflictResponse({
    description: ConflictMessages.Slug,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Author,
  })
  @Serialize(AuthorCompactResponseDto)
  @Patch(':id')
  async updateAuthor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAuthorDto,
  ): Promise<AuthorCompactResponseDto> {
    return this.authorsService.update(id, body);
  }

  @ApiOperation({
    summary: 'Delete a author',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Author,
  })
  @Serialize(AuthorCompactResponseDto)
  @Delete(':id')
  async deleteAuthor(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<AuthorCompactResponseDto> {
    return this.authorsService.delete(id);
  }
}
