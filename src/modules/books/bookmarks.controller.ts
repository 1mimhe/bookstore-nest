import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { BookmarkDto } from './dtos/bookmark.dto';
import { BooksService } from './books.service';

@Controller(['bookmarks', 'books/bookmark'])
@ApiTags('Bookmarks')
export class BookmarksController {
  constructor(private booksService: BooksService) {}

  @ApiOperation({
    summary: 'Bookmark a book (For all authorized users)',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  async bookmark(
    @Body() body: BookmarkDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.booksService.bookmark(userId, body);
  }

  @ApiOperation({
    summary: 'Delete a bookmark (unbookmark) by bookId (For all authorized users)',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async unbookmark(
    @Param('id', ParseUUIDPipe) bookId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.booksService.unbookmark(userId, bookId);
  }
}
