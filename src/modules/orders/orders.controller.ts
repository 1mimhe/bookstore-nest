import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiOperation, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { UnprocessableEntityMessages } from 'src/common/enums/error.messages';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AddBookToBasketDto } from './dto/add-book.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @ApiOperation({
    summary: 'Add a book to a user’s basket',
    description: `Adds a specified quantity of a book to the user's basket. If the book already exists in the basket, 
      the requested quantity is added to the existing quantity. Requires user authentication.`
  })
  @ApiBearerAuth()
  @ApiUnprocessableEntityResponse({
    description: UnprocessableEntityMessages.BookStock
  })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('basket/add-book')
  async addBookToBasket(
    @Body() body: AddBookToBasketDto,
    @CurrentUser('id') userId: string
  ) {
    return this.ordersService.addBookToBasket(userId, body);
  }
}
