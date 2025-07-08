import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  Session,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  ConflictResponseDto,
  ValidationErrorResponseDto,
} from 'src/common/dtos/error.dtos';
import { SigninDto } from './dtos/signin.dto';
import { AuthMessages } from 'src/common/enums/auth.messages';
import { Request, Response } from 'express';
import { CookieNames } from 'src/common/enums/cookie.names';
import { ConfigService } from '@nestjs/config';
import { SessionData } from 'express-session';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AccessTokenDto } from './dtos/access-token.dto';
import { Cookies } from 'src/common/decorators/cookies.decorator';

@Controller('auth')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private config: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Sign up a new user account',
    description:
      'Register a new user with unique username, email, and phone number',
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
  @Serialize(UserDto)
  @Post('signup')
  signup(@Body() body: CreateUserDto) {
    return this.authService.signup(body);
  }

  @ApiOperation({
    summary: 'Sign in a user',
    description:
      'Login a user and returns an access token with 20m expiration time',
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: AuthMessages.InvalidCredentials,
  })
  @ApiOkResponse({
    type: AccessTokenDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() body: SigninDto,
    @Session() session: SessionData,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (session.refreshToken) {
      throw new BadRequestException(AuthMessages.AlreadyAuthorized);
    }

    const { accessToken, refreshToken, userId } = await this.authService.signin(body);
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

  @ApiOperation({
    summary: 'Sign out a user',
    description: 'Sign out a user and clear its session and auth cookies',
  })
  @HttpCode(HttpStatus.OK)
  @Post('signout')
  signout(
    @Session() session: SessionData,
    @Res({ passthrough: true }) res: Response,
  ) {
    session.destroy();
    res.clearCookie(CookieNames.RefreshToken);
    res.clearCookie(CookieNames.SessionId);

    return true;
  }

  @ApiOperation({
    summary: 'Retrieves the current authorized user',
  })
  @ApiOkResponse({
    type: UserDto,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Serialize(UserDto)
  @Get('whoami')
  whoAmI(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiOkResponse({
    type: AccessTokenDto,
  })
  @Get('refresh-token')
  refreshTokens(
    @Cookies(CookieNames.RefreshToken) oldRefreshToken: string,
    @Session() session: SessionData,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!(session.userId && oldRefreshToken)) {
      throw new ForbiddenException(AuthMessages.AccessDenied);
    }

    const sessionRefreshToken = session.refreshToken;
    if (!(sessionRefreshToken) || (oldRefreshToken !== sessionRefreshToken)) {
      throw new UnauthorizedException(AuthMessages.InvalidRefreshToken);
    }

    const expirationTime = session.cookie.expires
      ? new Date(session.cookie.expires).getTime() - Date.now()
      : 0;
    const { accessToken, refreshToken } = this.authService.refreshTokens(oldRefreshToken, expirationTime);
    
    session.refreshToken = refreshToken;
    res.cookie(CookieNames.RefreshToken, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expirationTime
    });

    return {
      accessToken
    };
  }
}
