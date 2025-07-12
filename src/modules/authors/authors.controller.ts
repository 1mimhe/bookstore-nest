import { Body, ConflictException, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { Author } from './entities/author.entity';
import { AuthorsService } from './authors.service';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { UpdateAuthorDto } from './dtos/update-author.dto';
import { NotFoundMessages } from 'src/common/enums/not-found.messages';
import { ConflictMessages } from 'src/common/enums/conflict.messages';

@Controller('authors')
export class AuthorsController {
  constructor(
    private authorsService: AuthorsService
  ) {}
  
  @ApiOperation({ 
    summary: 'Create a new author',
    description: 'Creates a new author (or translator) with the provided information'
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.Slug
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createAuthor(@Body() body: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(body);
  }

  @ApiOperation({ 
    summary: 'Retrieves a author by its id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Author
  })
  @Get(':id')
  async getAuthorById(@Param('id', ParseUUIDPipe) id: string): Promise<Author> {
    return this.authorsService.getById(id);
  }

  @ApiOperation({ 
    summary: 'Retrieves a author by its slug',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Author
  })
  @Get('/by-slug/:slug')
  async getAuthorBySlug(@Param('slug') slug: string): Promise<Author> {
    return this.authorsService.getBySlug(slug);
  }

  @ApiOperation({ 
    summary: 'Retrieves all authors',
  })
  @Get()
  async getAllAuthors(): Promise<Author[]> {
    return this.authorsService.getAll();
  }

  @ApiOperation({ 
    summary: 'Update a author',
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: ConflictMessages.Slug
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Author
  })
  @Patch(':id')
  async updateAuthor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAuthorDto
  ): Promise<Author> {    
    return this.authorsService.update(id, body);
  }

  @ApiOperation({ 
    summary: 'Delete a author',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: NotFoundMessages.Author
  })
  @Delete(':id')
  async deleteAuthor(@Param('id', ParseUUIDPipe) id: string): Promise<Author> {
    return this.authorsService.delete(id);
  }
}
