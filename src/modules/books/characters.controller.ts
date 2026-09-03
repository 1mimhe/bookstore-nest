import {
  Body,
  Controller,
  DefaultValuePipe,
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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { ValidationErrorResponseDto } from 'src/common/error.dtos';
import { TitlesService } from './titles.service';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { UpdateCharacterDto } from './dtos/update-character.dto';
import { CharacterCompactResponseDto, CharacterResponseDto } from './dtos/character-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from '../users/entities/role.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiQueryComplete, ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { SessionData } from 'express-session';
import { RecentViewTypes } from 'src/common/types/recent-view.type';
import { TrackRecentView } from 'src/common/decorators/track-recent-view.decorator';
import { RecentViewsInterceptor } from 'src/common/interceptors/recent-views.interceptor';

@Controller(['characters', 'books/characters'])
@ApiTags('Characters')
export class CharactersController {
  constructor(
    private titlesService: TitlesService,
  ) {}

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
  @Post()
  async createBookCharacter(
    @Body() body: CreateCharacterDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string,
  ): Promise<CharacterCompactResponseDto> {
    return this.titlesService.createCharacter(body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Retrieves a character by its id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Character,
  })
  @ApiQueryComplete('books')
  @ApiQueryPagination()
  @Serialize(CharacterResponseDto)
  @Get('id/:id')
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
    description: NotFoundMessages.Character,
  })
  @ApiQueryComplete('books')
  @ApiQueryPagination()
  @Serialize(CharacterResponseDto)
  @UseInterceptors(RecentViewsInterceptor)
  @TrackRecentView(RecentViewTypes.Character)
  @Get('slug/:slug')
  async getBookCharacterBySlug(
    @Param('slug') slug: string,
    @Query('complete', new ParseBoolPipe({ optional: true })) complete?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<CharacterResponseDto> {
    return this.titlesService.getCharacter({ slug }, page, limit, complete);
  }

  @ApiOperation({
    summary: 'Update a character by its id (For Admin and ContentManager)',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Character,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Serialize(CharacterCompactResponseDto)
  @Patch(':id')
  async updateBookCharacter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCharacterDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string,
  ): Promise<CharacterCompactResponseDto> {
    return this.titlesService.updateCharacter(id, body, userId, session.staffId);
  }
}
