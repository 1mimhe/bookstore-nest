import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { ApiBadRequestResponse, ApiConflictResponse, ApiOperation } from '@nestjs/swagger';
import { ConflictResponseDto, ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';

@Controller('auth')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @ApiOperation({ 
    summary: 'Create a new user account',
    description: 'Register a new user with unique username, email, and phone number'
  })
  @ApiConflictResponse({
    type: ConflictResponseDto
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto
  })
  @Post('signup')
  signup(@Body() body: CreateUserDto) {
    return this.authService.signup(body);
  }
}
