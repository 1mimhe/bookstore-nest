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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthMessages } from 'src/common/enums/error.messages';
import { UserResponseDto } from './dtos/user-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UsersService } from './users.service';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { BookmarkTypes } from '../books/entities/bookmark.entity';
import { BookmarksDto } from './dtos/bookmark.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AddressResponseDto } from './dtos/address-response.dto';

@Controller('users')
@ApiTags('User')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({
    summary: 'Retrieves the current authorized user',
  })
  @ApiUnauthorizedResponse({
    description: AuthMessages.MissingAccessToken,
  })
  @ApiBearerAuth()
  @Serialize(UserResponseDto)
  @Get('whoami')
  whoAmI(@CurrentUser() user: UserResponseDto): UserResponseDto {
    return user;
  }

  @ApiOperation({
    summary: 'Update authorized user',
  })
  @ApiBearerAuth()
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
  @ApiOkResponse({
    type: AddressResponseDto
  })
  @ApiBearerAuth()
  @Serialize(AddressResponseDto)
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
  @ApiOkResponse({
    type: [AddressResponseDto]
  })
  @ApiBearerAuth()
  @Serialize(AddressResponseDto)
  @Get('addresses')
  getAllUserAddresses(@CurrentUser('id') userId: string) {
    return this.usersService.getAllUserAddresses(userId);
  }

  @ApiOperation({
    summary: 'Update a address by its id',
  })
  @ApiOkResponse({
    type: [AddressResponseDto]
  })
  @ApiBearerAuth()
  @Serialize(AddressResponseDto)
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
  @Delete('addresses/:id')
  deleteAddress(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteAddress(id);
  }

  @ApiOperation({
    summary: 'Get all user bookmarks by its type',
  })
  @ApiOkResponse({
    type: BookmarksDto
  })
  @ApiQueryPagination()
  @ApiBearerAuth()
  @Serialize(BookmarksDto)
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
