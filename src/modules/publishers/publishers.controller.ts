import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PublishersService } from './publishers.service';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CreatePublisherDto } from './dtos/create-publisher.dto';
import { UserDto } from '../users/dtos/user.dto';
import {
  ConflictResponseDto,
  ValidationErrorResponseDto,
} from 'src/common/dtos/error.dtos';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PublisherDto } from './dtos/publisher.dto';
import { UpdatePublisherDto } from './dtos/update-publisher.dto';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { NotFoundMessages } from 'src/common/enums/error.messages';

@Controller('publishers')
export class PublishersController {
  constructor(private publishersService: PublishersService) {}

  @ApiOperation({
    summary: 'Sign up a new publisher',
    description:
      'Register a new publisher with unique username, email, and phone number',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.PublisherName
  })
  @ApiConflictResponse({
    type: ConflictResponseDto,
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiCreatedResponse({
    type: UserDto,
  })
  @Serialize(PublisherDto)
  @Post('signup')
  async signup(@Body() body: CreatePublisherDto) {
    return this.publishersService.signup(body);
  }

  @ApiOperation({
    summary: 'Retrieves a publisher by its id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Publisher
  })
  @ApiQuery({
    name: 'complete',
    required: false,
    type: Boolean,
    description: 'Include related books in the response',
  })
  @Get('id/:id')
  async getPublisherById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('complete', new ParseBoolPipe({ optional: true })) complete?: boolean,
  ) {
    const relations = complete ? ['books.translators', 'books.title.authors'] : [];
    return this.publishersService.getById(id, relations);
  }

  @ApiOperation({
    summary: 'Retrieves a publisher by its slug',
    description: 'Includes relations.'
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Publisher
  })
  @ApiQuery({
    name: 'complete',
    required: false,
    type: Boolean,
    description: 'Include related books in the response',
  })
  @Get(':id')
  async getPublisherBySlug(@Param('id', ParseUUIDPipe) id: string) {
    return this.publishersService.getBySlug(id);
  }

  @ApiOperation({
    summary: 'Update a publisher by its id  (publisher related details only)',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.PublisherName
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Publisher
  })
  @Patch(':id')
  async updatePublisher(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePublisherDto
  ) {
    return this.publishersService.update(id, body);
  }
}
