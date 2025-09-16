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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PublishersService } from './publishers.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SignupPublisherDto } from './dtos/create-publisher.dto';
import {
  ConflictResponseDto,
  ValidationErrorResponseDto,
} from 'src/common/error.dtos';
import { Serialize } from 'src/common/serialize.interceptor';
import { CreatePublisherResponseDto, PublisherCompactResponseDto, PublisherPlusResDto, PublisherResponseDto } from './dtos/publisher-response.dto';
import { UpdatePublisherDto } from './dtos/update-publisher.dto';
import { BadRequestMessages, ConflictMessages } from 'src/common/enums/error.messages';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { ApiQueryComplete, ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from '../users/entities/role.entity';
import { BookResponseDto } from '../books/dtos/book-response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateBookDto } from '../books/dtos/create-book.dto';
import { BlogCompactResponseDto } from '../blogs/dtos/blog-response.dto';
import { CreateBlogDto } from '../blogs/dtos/create-blog.dto';
import { UpdateBlogDto } from '../blogs/dtos/update-blog.dto';
import { ConfigService } from '@nestjs/config';
import { BaseController } from 'src/common/base.controller';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { Request, Response } from 'express';
import { CookieNames } from 'src/common/enums/cookie.names';
import { RecentView, RecentViewTypes } from 'src/common/types/recent-view.type';
import { ViewsService } from '../views/views.service';
import { ViewEntityTypes } from '../views/views.types';

@Controller('publishers')
@ApiTags('Publisher')
export class PublishersController extends BaseController {
  constructor(
    private publishersService: PublishersService,
    config: ConfigService,
    private viewsService: ViewsService
  ) {
    super(config);
  }

  @ApiOperation({
    summary: 'Sign up a new publisher',
    description:
      'Register a new publisher with unique username, email, and phone number',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: ConflictMessages.PublisherName
  })
  @ApiConflictResponse({
    type: ConflictResponseDto,
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiBearerAuth()
  @Serialize(CreatePublisherResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @Post('signup')
  async signup(
    @Body() body: SignupPublisherDto
  ): Promise<CreatePublisherResponseDto> {
    return this.publishersService.signup(body);
  }

  @ApiOperation({ 
    summary: 'Retrieves all publishers',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for paginated relations (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of titles per page (default: 10)',
  })
  @Serialize(PublisherPlusResDto)
  @Get()
  async getAllAuthors(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<PublisherPlusResDto[]> {
    return this.publishersService.getAll(page, limit);
  }

  @ApiOperation({
    summary: 'Retrieves a publisher by its id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher
  })
  @ApiQueryComplete('books')
  @ApiQueryPagination()
  @Serialize(PublisherResponseDto)
  @Get('id/:id')
  async getPublisherById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('complete', new ParseBoolPipe({ optional: true })) complete?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<PublisherResponseDto> {
    return this.publishersService.get({ id }, page, limit, complete);
  }

  @ApiOperation({
    summary: 'Retrieves a publisher by its slug',
    description: 'If you want to filter books. You should use \`GET /books/publisher/:id\`'
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher
  })
  @ApiQueryComplete('books')
  @ApiQueryPagination()
  @Serialize(PublisherResponseDto)
  @Get('slug/:slug')
  async getPublisherBySlug(
    @Param('slug') slug: string,
    @Cookies(CookieNames.RecentViews) recentViewsCookie: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('complete', new ParseBoolPipe({ optional: true })) complete?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @CurrentUser('id') userId?: string
  ): Promise<PublisherResponseDto> {
    const publisher = await this.publishersService.get({ slug }, page, limit, complete);

    const newRecentView: RecentView = {
      type: RecentViewTypes.Publisher,
      slug: publisher.slug
    };
    this.updateRecentViewsCookie(res, recentViewsCookie, newRecentView);

    await this.viewsService.recordView(
      ViewEntityTypes.Publisher,
      publisher.id,
      req,
      res,
      userId
    );
    
    return publisher;
  }

  @ApiOperation({
    summary: 'Update a publisher by its id (publisher related details only)',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: ConflictMessages.PublisherName
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher
  })
  @Serialize(PublisherCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.Publisher
  )
  @Patch(':id')
  async updatePublisher(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePublisherDto
  ): Promise<PublisherCompactResponseDto> {
    return this.publishersService.update(id, body);
  }

  @ApiOperation({
    summary: 'Create a book (Publish a book)',
    description: 'The `publisherId` will be ignored'
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
    RolesEnum.Publisher
  )
  @HttpCode(HttpStatus.CREATED)
  @Post('books')
  async createBook(
    @Body() body: CreateBookDto,
    @CurrentUser('id') userId: string
  ): Promise<BookResponseDto> {
    return this.publishersService.createBook(userId, body);
  }

  @ApiOperation({
    summary: 'Create a blog by a publisher',
    description: 'The `publisherId` will be ignored'
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Title,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Author,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiConflictResponse({
    description: ConflictMessages.Slug,
  })
  @ApiBearerAuth()
  @Serialize(BlogCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager, RolesEnum.Publisher)
  @HttpCode(HttpStatus.CREATED)
  @Post('blogs')
  async createBlog(
    @Body() body: CreateBlogDto,
    @CurrentUser('id') userId: string
  ): Promise<BlogCompactResponseDto> {
    return this.publishersService.createBlog(userId, body);
  }

  @ApiOperation({
    summary: 'Update a publisher\'s blog',
    description: 'You should '
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Title,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Author,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiBadRequestResponse({
    description: BadRequestMessages.CannotUpdateBlog,
  })
  @ApiConflictResponse({
    description: ConflictMessages.Slug,
  })
  @ApiBearerAuth()
  @Serialize(BlogCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @Patch('blogs/:id')
  async updateBlog(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBlogDto,
    @CurrentUser('id') userId: string
  ): Promise<BlogCompactResponseDto> {
    return this.publishersService.updateBlog(userId, id, body);
  }
}
