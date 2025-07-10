import { Body, Controller, Post } from '@nestjs/common';
import { PublishersService } from './publishers.service';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { CreatePublisherDto } from './dtos/create-publisher.dto';
import { UserDto } from '../users/dtos/user.dto';
import { ConflictResponseDto, ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';

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
  @Post('signup')
  signup(@Body() body: CreatePublisherDto) {
    return this.publishersService.signupPublisher(body);
  }
}
