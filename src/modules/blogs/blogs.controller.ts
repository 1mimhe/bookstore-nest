import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';
import { ConflictMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { BlogCompactResponseDto } from './dtos/blog-response.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @ApiOperation({
    summary: 'Create a Blog',
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
    summary: 'Update a Blog',
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
