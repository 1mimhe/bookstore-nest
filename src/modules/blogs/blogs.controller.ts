import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ValidationErrorResponseDto } from 'src/common/error.dtos';
import {
  ConflictMessages,
  NotFoundMessages,
} from 'src/common/enums/error.messages';
import { Serialize } from 'src/common/serialize.interceptor';
import {
  BlogCompactResponseDto,
  BlogResponseDto,
} from './dtos/blog-response.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesEnum } from '../users/entities/role.entity';
import { SessionData } from 'express-session';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { CookieNames } from 'src/common/enums/cookie.names';
import { RecentView, RecentViewTypes } from 'src/common/types/recent-view.type';
import { BaseController } from 'src/common/base.controller';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { BlogFilterDto } from './dtos/blog-filter.dto';
import { ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('blogs')
@ApiTags('Blog')
export class BlogsController extends BaseController {
  constructor(
    private blogsService: BlogsService,
    config: ConfigService
  ) {
    super(config);
  }

  @ApiOperation({
    summary: 'Create a blog',
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
  @Post()
  async createBlog(
    @Body() body: CreateBlogDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<BlogCompactResponseDto> {
    return this.blogsService.create(body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Get a blog by its id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Blog,
  })
  @Serialize(BlogResponseDto)
  @Get('id/:id')
  async getBlogById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BlogResponseDto> {
    return this.blogsService.get({ id });
  }

  @ApiOperation({
    summary: 'Get a blog by its slug',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Blog,
  })
  @Serialize(BlogResponseDto)
  @Get('slug/:slug')
  async getBlogBySlug(
    @Param('slug') slug: string,
    @Cookies(CookieNames.RecentViews) recentViewsCookie: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<BlogResponseDto> {
    const blog = await this.blogsService.get({ slug });

    const newRecentView: RecentView = {
      type: RecentViewTypes.Blog,
      slug: blog.slug
    };
    this.updateRecentViewsCookie(res, recentViewsCookie, newRecentView);

    return blog;
  }

  @ApiOperation({
    summary: 'Get all blogs',
    description: 'You can get related blogs to an specific title, author or publisher'
  })
  @ApiQueryPagination()
  @Serialize(BlogCompactResponseDto)
  @Get()
  async getAllBlogs(@Query() query: BlogFilterDto): Promise<BlogCompactResponseDto[]> {
    return this.blogsService.getAll(query);
  }

  @ApiOperation({
    summary: 'Update a blog',
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
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @Patch(':id')
  async updateBlog(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBlogDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string
  ): Promise<BlogCompactResponseDto> {
    return this.blogsService.update(id, body, userId, session.staffId);
  }
}
