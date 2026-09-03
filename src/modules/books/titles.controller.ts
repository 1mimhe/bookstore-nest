import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  Session,
  UseGuards,
  UseInterceptors,
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
import { BadRequestMessages, ConflictMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { ValidationErrorResponseDto } from 'src/common/error.dtos';
import { TitlesService } from './titles.service';
import { CreateTitleDto } from './dtos/create-title.dto';
import { UpdateTitleDto } from './dtos/update-title.dto';
import { TitleCompactResponseDto, TitleResponseDto } from './dtos/title-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SoftAuthGuard } from '../auth/guards/soft-auth.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from '../users/entities/role.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SessionData } from 'express-session';
import { Request, Response } from 'express';
import { ViewsService } from '../views/views.service';
import { TrendingPeriod, ViewEntityTypes } from '../views/views.types';
import { RecentViewTypes } from 'src/common/types/recent-view.type';
import { TrackRecentView } from 'src/common/decorators/track-recent-view.decorator';
import { RecentViewsInterceptor } from 'src/common/interceptors/recent-views.interceptor';

@Controller(['titles', 'books/titles'])
@ApiTags('Titles')
export class TitlesController {
  constructor(
    private titlesService: TitlesService,
    private viewsService: ViewsService,
  ) {}

  @ApiOperation({
    summary: 'Create a title (For Admin, ContentManager, InventoryManager)',
    description: "If included tag doesn't exists, that will be created.",
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
    RolesEnum.InventoryManager,
  )
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createTitle(
    @Body() body: CreateTitleDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string,
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
    type: TitleResponseDto,
  })
  @UseGuards(SoftAuthGuard)
  @Serialize(TitleResponseDto)
  @UseInterceptors(RecentViewsInterceptor)
  @TrackRecentView(RecentViewTypes.Title)
  @Get('slug/:slug')
  async getTitleBySlug(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser('id') userId?: string,
  ): Promise<TitleResponseDto> {
    const title = await this.titlesService.getBySlug(slug);

    await this.viewsService.recordView(
      ViewEntityTypes.Title,
      title.id,
      req,
      res,
      userId,
    );

    return title;
  }

  @ApiOperation({
    summary: 'Retrieves titles similar to a specific title',
    description: 'Retrieves titles that have the most common tags with the title.',
  })
  @ApiOkResponse({
    type: TitleResponseDto,
  })
  @Serialize(TitleResponseDto)
  @Get(':id/similar')
  async getSimilarTitles(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit', new DefaultValuePipe(10), new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<TitleResponseDto[]> {
    return this.titlesService.getSimilarTitles(id, limit);
  }

  @ApiOperation({
    summary: 'Retrieves trending titles (Based on views)',
  })
  @Serialize(TitleResponseDto)
  @Get('trending/:period')
  async getTrendingTitles(
    @Param('period', new ParseEnumPipe(TrendingPeriod)) period: TrendingPeriod,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ): Promise<TitleResponseDto[]> {
    return this.titlesService.getTrending(period, limit);
  }

  @ApiOperation({
    summary: 'Update a title (For Admin and ContentManager)',
    description: `It overrides authors, features and quotes; 
    tags and characters will be merged if included.
    If included tag doesn't exist, that will be created.`,
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
  @Patch(':id')
  async updateTitle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTitleDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string,
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
  @Patch(':titleId/default-book/:bookId')
  async setDefaultBook(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string,
  ): Promise<TitleCompactResponseDto> {
    return this.titlesService.setDefaultBook(titleId, bookId, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Delete a tag from a title (For Admin and ContentManager)',
    description: "Doesn't retrieve anything at all.",
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Delete(':titleId/tags/:tagId')
  async deleteTagFromTitle(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
  ) {
    return this.titlesService.deleteTagFromTitle(titleId, tagId);
  }

  @ApiOperation({
    summary: 'Delete a character from a title (For Admin and ContentManager)',
    description: "Doesn't retrieve anything at all.",
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Delete(':titleId/characters/:characterId')
  async deleteCharacterFromTitle(
    @Param('titleId', ParseUUIDPipe) titleId: string,
    @Param('characterId', ParseUUIDPipe) characterId: string,
  ) {
    return this.titlesService.deleteCharacterFromTitle(titleId, characterId);
  }
}
