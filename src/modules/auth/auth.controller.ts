import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Session,
} from '@nestjs/common';
import { SignupUserDto } from './dtos/sign-up.dto';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  ConflictResponseDto,
  ValidationErrorResponseDto,
} from 'src/common/error.dtos';
import { SigninDto } from './dtos/sign-in.dto';
import { AuthMessages } from 'src/common/enums/error.messages';
import { Response } from 'express';
import { CookieNames } from 'src/common/enums/cookie.names';
import { SessionData } from 'express-session';
import { Serialize } from 'src/common/serialize.interceptor';
import { AccessTokenDto } from './dtos/access-token.dto';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { TokenService } from '../token/token.service';
import { CookieService } from 'src/common/services/cookie.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private cookieService: CookieService,
  ) {}

  @ApiOperation({
    summary: 'Sign up a new user account (customer)',
    description:
      'Register a new user with unique username, email, and phone number',
  })
  @ApiConflictResponse({
    type: ConflictResponseDto,
    description: ConflictMessages.AlreadyExists
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
  })
  @Serialize(UserResponseDto)
  @Post('signup')
  signup(@Body() body: SignupUserDto) {
    return this.authService.signup(body);
  }

  @ApiOperation({
    summary: 'Sign in a user',
    description:
      'Login a user and establish an authenticated session backed by Redis',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
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
    if (session.userId) {
      throw new BadRequestException(AuthMessages.AlreadyAuthorized);
    }

    const {
      accessToken, refreshToken,
      userId, staffId, roles
    } = await this.authService.signin(body);

    session.userId = userId;
    session.staffId = staffId;
    session.refreshToken = refreshToken;
    session.roles = roles;

    this.cookieService.setCookie(res, CookieNames.RefreshToken, refreshToken);

    return {
      accessToken,
      userId,
      roles,
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
    session.destroy(() => {});
    res.clearCookie(CookieNames.RefreshToken);
    res.clearCookie(CookieNames.SessionId);

    return { success: true, message: 'Successfully signed out' };
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
    const {
      accessToken,
      refreshToken,
      expirationTime
    } = this.tokenService.refreshTokens(oldRefreshToken, session);

    session.refreshToken = refreshToken;
    this.cookieService.setCookie(res, CookieNames.RefreshToken, refreshToken, expirationTime);

    return {
      accessToken
    };
  }
}
