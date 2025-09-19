import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
    summary: 'Get all discount codes',
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
}
