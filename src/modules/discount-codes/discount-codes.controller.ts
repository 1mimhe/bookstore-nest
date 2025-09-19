import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ValidationErrorResponseDto } from 'src/common/error.dtos';
import { DiscountCodesService } from './discount-codes.service';
import { CreateDiscountCodeDto } from './dtos/create-discount-code.dto';
import { DiscountCodeResponseDto, DiscountCodeCheckResponseDto } from './dtos/discount-code-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from '../users/entities/role.entity';
import { BaseController } from 'src/common/base.controller';
import { ConfigService } from '@nestjs/config';
import { DiscountCodeQueryDto } from './dtos/discount-code-query.dto';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CheckDiscountCodeDto } from './dtos/check-discount-code.dto';
import { UpdateDiscountCodeDto } from './dtos/update-discount-code.dto';

@Controller('discount-codes')
@ApiTags('Discount Codes')
export class DiscountCodesController extends BaseController {
  constructor(
    private readonly discountCodesService: DiscountCodesService,
    config: ConfigService
  ) {
    super(config);
  }

  @ApiOperation({
    summary: 'Create a discount code',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Some users not found.',
  })
  @ApiBearerAuth()
  @Serialize(DiscountCodeResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.InventoryManager
  )
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createDiscountCode(
    @Body() discountCodeDto: CreateDiscountCodeDto
  ): Promise<DiscountCodeResponseDto> {
    return this.discountCodesService.create(discountCodeDto);
  }

  @ApiOperation({
    summary: 'Retrieves all discount codes',
    description: 'With pagination, filtering, and search capabilities.',
  })
  @ApiOkResponse({
    type: [DiscountCodeResponseDto],
  })
  @Serialize(DiscountCodeResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.InventoryManager
  )
  @Get()
  async getAllDiscounts(
    @Query() query: DiscountCodeQueryDto
  ): Promise<DiscountCodeResponseDto[]> {
    return this.discountCodesService.getAll(query);
  }

  @ApiOperation({
    summary: 'Retrieves a discount code by code',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.DiscountCode,
  })
  @ApiOkResponse({
    type: DiscountCodeResponseDto,
  })
  @Serialize(DiscountCodeResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.InventoryManager
  )
  @Get(':code')
  async getDiscountCodeByCode(
    @Param('code') code: string
  ): Promise<DiscountCodeResponseDto> {
    return this.discountCodesService.getByCode(code);
  }

    @ApiOperation({
    summary: 'Update a discount code',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.DiscountCode,
  })
  @ApiNotFoundResponse({
    description: 'Some users not found.',
  })
  @ApiBearerAuth()
  @Serialize(DiscountCodeResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.InventoryManager
  )
  @Patch(':id')
  async updateDiscountCode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDiscountCodeDto: UpdateDiscountCodeDto
  ): Promise<DiscountCodeResponseDto> {
    return this.discountCodesService.update(id, updateDiscountCodeDto);
  }

  @ApiOperation({
    summary: 'Check if a discount code is valid',
    description: 'Checks if a discount code can be applied to a given price.',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiOkResponse({
    type: DiscountCodeCheckResponseDto,
  })
  @Serialize(DiscountCodeCheckResponseDto)
  @Post('check')
  async checkDiscountCode(
    @Body() checkDiscountCodeDto: CheckDiscountCodeDto,
    @CurrentUser('id') userId: string
  ): Promise<DiscountCodeCheckResponseDto> {
    return this.discountCodesService.checkDiscountCode(checkDiscountCodeDto, userId);
  }

}
