import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PublishersService } from './publishers.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SignupPublisherDto } from './dtos/create-publisher.dto';
import {
  ConflictResponseDto,
  ValidationErrorResponseDto,
} from 'src/common/dtos/error.dtos';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { CreatePublisherResponseDto, PublisherCompactResponseDto, PublisherPlusResDto, PublisherResponseDto } from './dtos/publisher-response.dto';
import { UpdatePublisherDto } from './dtos/update-publisher.dto';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { ApiQueryComplete, ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from '../users/entities/role.entity';

@Controller('publishers')
@ApiTags('Publisher')
export class PublishersController {
  constructor(private publishersService: PublishersService) {}

  @ApiOperation({
    summary: 'Sign up a new publisher',
    description:
      'Register a new publisher with unique username, email, and phone number',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: ConflictMessages.PublisherName
  })
  @ApiConflictResponse({
    type: ConflictResponseDto,
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiBearerAuth()
  @Serialize(CreatePublisherResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin, RolesEnum.ContentManager)
  @Post('signup')
  async signup(
    @Body() body: SignupPublisherDto
  ): Promise<CreatePublisherResponseDto> {
    return this.publishersService.signup(body);
  }

  @ApiOperation({ 
    summary: 'Retrieves all publishers',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for paginated relations (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of titles per page (default: 10)',
  })
  @Serialize(PublisherPlusResDto)
  @Get()
  async getAllAuthors(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<PublisherPlusResDto[]> {
    return this.publishersService.getAll(page, limit);
  }

  @ApiOperation({
    summary: 'Retrieves a publisher by its id',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher
  })
  @ApiQueryComplete('books')
  @ApiQueryPagination()
  @Serialize(PublisherResponseDto)
  @Get('id/:id')
  async getPublisherById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('complete', new ParseBoolPipe({ optional: true })) complete?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<PublisherResponseDto> {
    return this.publishersService.get({ id }, page, limit, complete);
  }

  @ApiOperation({
    summary: 'Retrieves a publisher by its slug'
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher
  })
  @ApiQueryComplete('books')
  @ApiQueryPagination()
  @Serialize(PublisherResponseDto)
  @Get('slug/:slug')
  async getPublisherBySlug(
    @Param('slug') slug: string,
    @Query('complete', new ParseBoolPipe({ optional: true })) complete?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<PublisherResponseDto> {
    return this.publishersService.get({ slug }, page, limit, complete);
  }

  @ApiOperation({
    summary: 'Update a publisher by its id (publisher related details only)',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: ConflictMessages.PublisherName
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher
  })
  @Serialize(PublisherCompactResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.Publisher
  )
  @Patch(':id')
  async updatePublisher(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePublisherDto
  ): Promise<PublisherCompactResponseDto> {
    return this.publishersService.update(id, body);
  }
}
