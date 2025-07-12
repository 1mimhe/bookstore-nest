import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
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

@Controller('publishers')
export class PublishersController {
  constructor(private publishersService: PublishersService) {}

  @ApiOperation({
    summary: 'Sign up a new publisher',
    description:
      'Register a new publisher with unique username, email, and phone number',
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
    return this.publishersService.signupPublisher(body);
  }

  @ApiOperation({
    summary: 'Retrieves a publisher by its id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException
  })
  @ApiQuery({
    name: 'complete',
    required: false,
    type: Boolean,
    description: 'Include related books in the response',
  })
  @Get(':id')
  async getPublisherById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('complete', new ParseBoolPipe({ optional: true })) complete?: boolean,
  ) {
    const relations = complete ? ['books'] : [];
    return this.publishersService.getById(id, relations);
  }
}
