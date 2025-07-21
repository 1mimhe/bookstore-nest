import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';
import { ConflictMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { BlogCompactResponseDto, BlogResponseDto } from './dtos/blog-response.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

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
  @Serialize(BlogCompactResponseDto)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBlog(
    @Body() body: CreateBlogDto
  ): Promise<BlogCompactResponseDto> {
    return this.blogsService.create(body);
  }

  @ApiOperation({
    summary: 'Get a blog by its id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Blog,
  })
  @Serialize(BlogResponseDto)
  @Get('id/:id')
  async getBlogById(@Param('id', ParseUUIDPipe) id: string): Promise<BlogResponseDto> {
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
  async getBlogBySlug(@Param('slug') slug: string): Promise<BlogResponseDto> {
    return this.blogsService.get({ slug });
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
  @Serialize(BlogCompactResponseDto)
  @Patch(':id')
  async updateBlog(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() body: UpdateBlogDto
  ): Promise<BlogCompactResponseDto> {
    return this.blogsService.update(id, body);
  }
}
