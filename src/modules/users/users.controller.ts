import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
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
import { ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { BookmarkTypes } from '../books/entities/bookmark.entity';
import { BookmarkDto } from './dtos/bookmark.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

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
  whoAmI(@CurrentUser() user: UserResponseDto): UserResponseDto {
    return user;
  }

  @ApiOperation({
    summary: 'Update authorized user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch()
  updateUser(
    @Body() body: UpdateUserDto,
    @CurrentUser('id') userId: string
  ) {
    return this.usersService.update(userId, body);
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
    @CurrentUser('id') userId: string
  ) {
    return this.usersService.createAddress(userId, body);
  }

  @ApiOperation({
    summary: 'Retrieves all user addresses',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('addresses')
  getAllUserAddresses(@CurrentUser('id') userId: string) {
    return this.usersService.getAllUserAddresses(userId);
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

  @ApiOperation({
    summary: 'Get all user bookmarks by its type',
  })
  @ApiOkResponse({
    type: BookmarkDto
  })
  @ApiQueryPagination()
  @ApiBearerAuth()
  @Serialize(BookmarkDto)
  @UseGuards(AuthGuard)
  @Get('bookmarks/:type')
  async getAllBookmarks(
    @Param('type', new ParseEnumPipe(BookmarkTypes)) type: BookmarkTypes,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @CurrentUser('id') userId: string
  ) {
    return this.usersService.getAllBookmarks(userId, type, page, limit);
  }
}
