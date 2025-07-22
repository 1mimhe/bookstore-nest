import {
  Body,
  Controller,
  Get,
  Post,
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
import { UserResponseDto } from './dtos/user-response.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({
    summary: 'Retrieves the current authorized user',
  })
  @ApiUnauthorizedResponse({
    description: AuthMessages.MissingAccessToken,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Serialize(UserResponseDto)
  @Get('whoami')
  whoAmI(@Req() req: Request): UserResponseDto {
    return req.user!;
  }

  @ApiOperation({
    summary: 'Create a address for user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('addresses')
  createAddress(
    @Body() body: CreateAddressDto,
    @Req() req: Request
  ) {
    return this.usersService.createAddress(req.user?.id!, body);
  }
}
