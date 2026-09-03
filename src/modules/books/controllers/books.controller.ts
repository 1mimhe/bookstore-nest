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
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConflictMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { ValidationErrorResponseDto } from 'src/common/error.dtos';
import { CreateBookDto } from '../dtos/create-book.dto';
import { BooksService } from '../services/books.service';
import { UpdateBookDto } from '../dtos/update-book.dto';
import { ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { BookResponseDto, ImageResponseDto } from '../dtos/book-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from '../../users/entities/role.entity';
import { SessionData } from 'express-session';
import { BookQueryDto } from '../dtos/book-query.dto';

@Controller('books')
@ApiTags('Books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @ApiOperation({
    summary: 'Retrieves all books',
    description: 'With pagination, different filtering, search and sorting.',
  })
  @ApiQueryPagination()
  @Serialize(BookResponseDto)
  @Get()
  async getAllBooks(
    @Query() query: BookQueryDto,
  ): Promise<BookResponseDto[]> {
    return this.booksService.getAll(query);
  }

  @ApiOperation({
    summary: 'Create a book (For Admin, ContentManager and InventoryManager)',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Language,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.SomeAuthors,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Title,
  })
  @ApiConflictResponse({
    description: ConflictMessages.ISBN,
  })
  @ApiBearerAuth()
  @Serialize(BookResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.InventoryManager,
  )
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBook(
    @Body() body: CreateBookDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string,
  ): Promise<BookResponseDto> {
    return this.booksService.create(body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Update a book (For Admin, ContentManager and InventoryManager)',
    description: 'It overrides translators and merges book images if included.',
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Language,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.SomeAuthors,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Publisher,
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Title,
  })
  @ApiConflictResponse({
    description: ConflictMessages.ISBN,
  })
  @ApiBearerAuth()
  @Serialize(BookResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
    RolesEnum.InventoryManager,
  )
  @Patch(':id')
  async updateBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBookDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string,
  ): Promise<BookResponseDto> {
    return this.booksService.update(id, body, userId, session.staffId);
  }

  @ApiOperation({
    summary: 'Delete a book image by id (For Admin and ContentManager)',
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.BookImage,
  })
  @ApiBearerAuth()
  @Serialize(ImageResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.ContentManager,
  )
  @Delete('images/:id')
  async deleteBookImage(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ImageResponseDto> {
    return this.booksService.deleteImage(id);
  }
}
