import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dtos/create-article.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';
import { ConflictMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ArticleResponseDto } from './dtos/article-response.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @ApiOperation({
    summary: 'Create a Article',
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
  @Serialize(ArticleResponseDto)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createArticle(
    @Body() body: CreateArticleDto
  ): Promise<ArticleResponseDto> {
    return this.articlesService.create(body);
  }
}
