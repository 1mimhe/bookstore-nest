import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthMessages } from 'src/common/enums/error.messages';
import { UserDto } from './dtos/user.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('users')
export class UsersController {
  @ApiOperation({
    summary: 'Retrieves the current authorized user',
  })
  @ApiUnauthorizedResponse({
    type: UnauthorizedException,
    description: AuthMessages.MissingAccessToken,
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
}
