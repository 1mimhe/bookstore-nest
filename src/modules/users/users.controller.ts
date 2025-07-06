import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  Session,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  ConflictResponseDto,
  ValidationErrorResponseDto,
} from 'src/common/dtos/error.dtos';
import { SigninDto } from './dtos/signin.dto';
import { AuthMessages } from 'src/common/enums/auth.messages';
import { Response } from 'express';
import { CookieNames } from 'src/common/enums/cookie.names';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private config: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Create a new user account',
    description:
      'Register a new user with unique username, email, and phone number',
  })
  @ApiConflictResponse({
    type: ConflictResponseDto,
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @Post('signup')
  signup(@Body() body: CreateUserDto) {
    return this.authService.signup(body);
  }

  @ApiOperation({
    summary: 'Login a user',
    description:
      'Login a user and returns an access token with 20m expiration time',
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: AuthMessages.InvalidCredentials,
  })
  @Post('signin')
  async signin(
    @Body() body: SigninDto,
    @Session() session: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (session.refreshToken) {
      throw new BadRequestException(AuthMessages.AlreadyAuthorized);
    }

    const { accessToken, refreshToken, userId } =
      await this.authService.signin(body);
    session.userId = userId;
    session.refreshToken = refreshToken;

    res.cookie(CookieNames.RefreshToken, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.config.get<number>('COOKIE_MAX_AGE', 15 * 24 * 3600 * 1000), // 15 days
    });

    return {
      accessToken,
    };
  }

  @Post('signout')
  signout(
    @Session() session: any,
    @Res({ passthrough: true }) res: Response
  ) {    
    session.destroy();
    res.clearCookie(CookieNames.RefreshToken);
    res.clearCookie(CookieNames.SessionId);

    return true;
  }
}
