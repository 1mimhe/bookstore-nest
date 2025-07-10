import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { Author } from './entities/author.entity';
import { AuthorsService } from './authors.service';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateAuthorDto } from './dtos/update-author.dto';

@Controller('authors')
export class AuthorsController {
  constructor(
    private authorsService: AuthorsService
  ) {}
  
  @ApiOperation({ 
    summary: 'Create a new author',
    description: 'Creates a new author (or translator) with the provided information'
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createAuthor(@Body() body: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(body);
  }

  @ApiOperation({ 
    summary: 'Retrieves a author by its id',
  })
  @Get(':id')
  async getAuthorById(@Param('id') id: string): Promise<Author> {
    return this.authorsService.getById(id);
  }

  @ApiOperation({ 
    summary: 'Retrieves a author by its slug',
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
  @Patch(':id')
  async updateAuthor(
    @Param('id') id: string,
    @Body() body: UpdateAuthorDto
  ): Promise<Author> {
    return this.authorsService.update(id, body);
  }

  @ApiOperation({ 
    summary: 'Delete a author',
  })
  @Delete(':id')
  async deleteAuthor(@Param('id') id: string): Promise<Author> {
    return this.authorsService.delete(id);
  }
}
