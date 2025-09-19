import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
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
}
