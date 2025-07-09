import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { Author } from './entities/author.entity';
import { AuthorsService } from './authors.service';
import { ApiOperation } from '@nestjs/swagger';

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
  async createProfile(@Body() body: CreateAuthorDto): Promise<Author> {
    return await this.authorsService.create(body);
  }
}
