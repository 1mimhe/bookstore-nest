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
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { AuthorsService } from './authors.service';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
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
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from '../users/entities/role.entity';
import { SessionData } from 'express-session';

@Controller('authors')
@ApiTags('Author')
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
  @ApiBearerAuth()
  @Serialize(AuthorResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createAuthor(
    @Body() body: CreateAuthorDto,
    @Session() session: SessionData
  ): Promise<AuthorResponseDto> {
    return this.authorsService.create(body, session.staffId);
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
    @Query('complete', new ParseBoolPipe({ optional: true })) complete?: boolean,
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
  @ApiBearerAuth()
  @Serialize(AuthorCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @Patch(':id')
  async updateAuthor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAuthorDto,
    @Session() session: SessionData
  ): Promise<AuthorCompactResponseDto> {
    return this.authorsService.update(id, body, session.staffId);
  }

  @ApiOperation({
    summary: 'Delete a author',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Author,
  })
  @ApiBearerAuth()
  @Serialize(AuthorCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @Delete(':id')
  async deleteAuthor(
    @Param('id', ParseUUIDPipe) id: string,
    @Session() session: SessionData
  ): Promise<AuthorCompactResponseDto> {
    return this.authorsService.delete(id, session.staffId);
  }
}
