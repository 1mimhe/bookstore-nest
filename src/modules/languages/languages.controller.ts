import { Body, ConflictException, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { CreateLanguageDto } from '../books/dtos/create-language.dto';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private languagesService: LanguagesService) {}

  @ApiOperation({
    summary: 'Create a language',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.Language,
  })
  @Post('languages')
  async createLanguage(@Body() body: CreateLanguageDto) {
    return this.languagesService.create(body);
  }

  @ApiOperation({
    summary: 'Retrieves all languages',
  })
  @Get('languages')
  async getAllLanguages() {
    return this.languagesService.getAll();
  }
}
