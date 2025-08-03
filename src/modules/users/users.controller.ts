import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { UpdateAddressDto } from './dtos/update-address.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

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
  whoAmI(@Req() req: Request): Partial<UserResponseDto> {
    return req.user!;
  }

  @ApiOperation({
    summary: 'Update authorized user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch()
  updateUser(
    @Req() req: Request,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(req.user?.id!, body);
  }

  @ApiOperation({
    summary: 'Create a address for user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('addresses')
  createAddress(
    @Body() body: CreateAddressDto,
    @Req() req: Request
  ) {
    return this.usersService.createAddress(req.user?.id!, body);
  }

  @ApiOperation({
    summary: 'Retrieves all user addresses',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('addresses')
  getAllUserAddresses(@Req() req: Request) {
    return this.usersService.getAllUserAddresses(req.user?.id!);
  }

  @ApiOperation({
    summary: 'Update a address by its id',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('addresses/:id')
  updateAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(id, body);
  }

  @ApiOperation({
    summary: 'Delete a address by its id',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('addresses/:id')
  deleteAddress(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteAddress(id);
  }
}
