import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dtos/create-language.dto';
import { ApiConflictResponse, ApiOperation } from '@nestjs/swagger';
import { ConflictMessages } from 'src/common/enums/conflict.messages';

@Controller('books')
export class BooksController {
  constructor(
    private languagesService: LanguagesService
  ) {}

  @ApiOperation({
    summary: 'Create a language',
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.Language
  })
  @Post('languages')
  async createLanguage(@Body() body: CreateLanguageDto) {
    return this.languagesService.create(body);
  }
}
