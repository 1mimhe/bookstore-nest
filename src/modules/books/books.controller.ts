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
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BadRequestMessages, ConflictMessages } from 'src/common/enums/error.messages';
import { TitlesService } from './titles.service';
import { CreateTitleDto } from './dtos/create-title.dto';
import { ValidationErrorResponseDto } from 'src/common/error.dtos';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { CreateBookDto } from './dtos/create-book.dto';
import { BooksService } from './books.service';
import { UpdateBookDto } from './dtos/update-book.dto';
import { ApiQueryComplete, ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { BookResponseDto, ImageResponseDto } from './dtos/book-response.dto';
import { TitleCompactResponseDto, TitleResponseDto } from './dtos/title-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { UpdateTitleDto } from './dtos/update-title.dto';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { UpdateCharacterDto } from './dtos/update-character.dto';
import { CharacterCompactResponseDto, CharacterResponseDto } from './dtos/character-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BookmarkDto } from './dtos/bookmark.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from '../users/entities/role.entity';
import { SessionData } from 'express-session';
import { BookFilterDto } from './dtos/book-filter.dto';
import { ConfigService } from '@nestjs/config';
import { BaseController } from 'src/common/base.controller';
import { Request, Response } from 'express';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { CookieNames } from 'src/common/enums/cookie.names';
import { RecentView, RecentViewTypes } from 'src/common/types/recent-view.type';
import { ViewsService } from '../views/views.service';
import { ViewEntityTypes } from '../views/views.types';
import { SoftAuthGuard } from '../auth/guards/soft-auth.guard';

@Controller('books')
@ApiTags('Book')
export class BooksController extends BaseController {
  constructor(
    private titlesService: TitlesService,
    private booksService: BooksService,
    private viewsService: ViewsService,
    config: ConfigService
  ) {
    super(config);
  }

  @ApiOperation({
    summary: 'Create a title (For Admin, ContentManager, InventoryManager)',
    description: 'If included tag doesn\'t exists, that will be created.'
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
  @ApiBearerAuth()
  @Serialize(TitleCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.InventoryManager
  )
  @HttpCode(HttpStatus.CREATED)
  @Post('titles')
  async createTitle(
    @Body() body: CreateTitleDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<TitleCompactResponseDto> {
    return this.titlesService.create(body, userId, session.staffId);
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
  @UseGuards(SoftAuthGuard)
  @Serialize(TitleResponseDto)
  @Get('titles/:slug')
  async getTitleBySlug(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Cookies(CookieNames.RecentViews) recentViewsCookie: string,
    @CurrentUser('id') userId?: string
  ): Promise<TitleResponseDto> {
    const title = await this.titlesService.getBySlug(slug);

    const newRecentView: RecentView = {
      type: RecentViewTypes.Title,
      slug: title.slug
    };
    this.updateRecentViewsCookie(res, recentViewsCookie, newRecentView);

    await this.viewsService.recordView(
      ViewEntityTypes.Title,
      title.id,
      req,
      res,
      userId
    );

    return title;
  }

  @ApiOperation({
    summary: 'Get titles similar to a specific title',
    description: 'Retrieves titles that have the most common tags with the title.'
  })
  @ApiOkResponse({
    type: TitleResponseDto
  })
  @Serialize(TitleResponseDto)
  @Get('titles/:id/similar')
  async getSimilarTitles(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit', new DefaultValuePipe(10), new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<TitleResponseDto[]> {
    return this.titlesService.getSimilarTitles(id, limit);
  }

  @ApiOperation({
    summary: 'Retrieves all books by its publisher id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiQueryPagination()
  @Serialize(BookResponseDto)
  @Get('publisher/:id')
  async getBooksByPublisherId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: BookFilterDto
  ): Promise<BookResponseDto[]> {
    return this.booksService.getByPublisherId(id, query);
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
    @Query() query: BookFilterDto
  ): Promise<BookResponseDto[]> {
    return this.booksService.getByAuthorId(id, query);
  }

  @ApiOperation({
    summary: 'Update a title (For Admin and ContentManager)',
    description: `It override authors, features and quotes; 
    tags and characters will be merged if included.
    If included tag doesn\'t exists, that will be created.`,
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
  @ApiBearerAuth()
  @Serialize(TitleCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Patch('titles/:id')
  async updateTitle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTitleDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<TitleCompactResponseDto> {
    return this.titlesService.update(id, body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Set a default book for a title (For Admin and ContentManager)',
  })
  @ApiBadRequestResponse({
    type: BadRequestMessages.CannotSetDefaultBook,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Title,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Book,
  })
  @ApiBearerAuth()
  @Serialize(TitleCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Patch('titles/:titleId/default-book/:bookId')
  async setDefaultBook(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<TitleCompactResponseDto> {
    return this.titlesService.setDefaultBook(titleId, bookId, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Delete a tag from a title (For Admin and ContentManager)',
    description: 'Doesn\'t retrieve anything at all.'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Delete('titles/:titleId/tags/:tagId')
  async deleteTagFromTitle(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
  ) {
    return this.titlesService.deleteTagFromTitle(titleId, tagId);
  }

  @ApiOperation({
    summary: 'Delete a character from a title (For Admin and ContentManager)',
    description: 'Doesn\'t retrieve anything at all.'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Delete('titles/:titleId/characters/:characterId')
  async deleteCharacterFromTitle(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Param('characterId', ParseUUIDPipe) characterId: string,
  ) {
    return this.titlesService.deleteCharacterFromTitle(titleId, characterId);
  }

  @ApiOperation({
    summary: 'Create a book (For Admin, ContentManager and InventoryManager)',
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
  @ApiBearerAuth()
  @Serialize(BookResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.InventoryManager,
  )
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBook(
    @Body() body: CreateBookDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<BookResponseDto> {
    return this.booksService.create(body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Update a book (For Admin, ContentManager and InventoryManager)',
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
  @ApiBearerAuth()
  @Serialize(BookResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.InventoryManager,
  )
  @Patch(':id')
  async updateBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBookDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<BookResponseDto> {
    return this.booksService.update(id, body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Delete a book image by id (For Admin and ContentManager)',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.BookImage,
  })
  @ApiBearerAuth()
  @Serialize(ImageResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Delete('images/:id')
  async deleteBookImage(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ImageResponseDto> {
    return this.booksService.deleteImage(id,);
  }

  @ApiOperation({
    summary: 'Create a book character (For Admin and ContentManager)',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiBearerAuth()
  @Serialize(CharacterCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @HttpCode(HttpStatus.CREATED)
  @Post('characters')
  async createBookCharacter(
    @Body() body: CreateCharacterDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<CharacterCompactResponseDto> {
    return this.titlesService.createCharacter(body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Retrieves a character by its id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Character
  })
  @ApiQueryComplete('books')
  @ApiQueryPagination()
  @Serialize(CharacterResponseDto)
  @Get('characters/id/:id')
  async getBookCharacterById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('complete', new ParseBoolPipe({ optional: true })) complete?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<CharacterResponseDto> {
    return this.titlesService.getCharacter({ id }, page, limit, complete);
  }

  @ApiOperation({
    summary: 'Retrieves a character by its slug',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Character
  })
  @ApiQueryComplete('books')
  @ApiQueryPagination()
  @Serialize(CharacterResponseDto)
  @Get('characters/slug/:slug')
  async getBookCharacterBySlug(
    @Param('slug') slug: string,
    @Cookies(CookieNames.RecentViews) recentViewsCookie: string,
    @Res({ passthrough: true }) res: Response,
    @Query('complete', new ParseBoolPipe({ optional: true })) complete?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<CharacterResponseDto> {
    const character = await this.titlesService.getCharacter({ slug }, page, limit, complete);

    const newRecentView: RecentView = {
      type: RecentViewTypes.Character,
      slug: character.slug
    };
    this.updateRecentViewsCookie(res, recentViewsCookie, newRecentView);

    return character;
  }

  @ApiOperation({
    summary: 'Update a character by its id (For Admin and ContentManager)',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Character
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Serialize(CharacterCompactResponseDto)
  @Patch('characters/:id')
  async updateBookCharacter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCharacterDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<CharacterCompactResponseDto> {
    return this.titlesService.updateCharacter(id, body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Bookmark a book (For all authorized users)',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('bookmark')
  async bookmark
  (
    @Body() body: BookmarkDto,
    @CurrentUser('id') userId: string
  ) {
    return this.booksService.bookmark(userId!, body);
  }

  @ApiOperation({
    summary: 'Delete a bookmark (unbookmark) by bookId (For all authorized users)',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('bookmark/:id')
  async unbookmark
  (
    @Param('id', ParseUUIDPipe) bookId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.booksService.unbookmark(userId!, bookId);
  }
}
