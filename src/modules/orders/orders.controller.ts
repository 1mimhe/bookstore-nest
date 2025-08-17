import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiOperation, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { UnprocessableEntityMessages } from 'src/common/enums/error.messages';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AddBookToCartDto } from './dto/add-book.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @ApiOperation({
    summary: 'Add a book to a user’s cart',
    description: `Adds a specified quantity of a book to the user's cart. If the book already exists in the cart, 
      the requested quantity is added to the existing quantity. Requires user authentication.`
  })
  @ApiBearerAuth()
  @ApiUnprocessableEntityResponse({
    description: UnprocessableEntityMessages.BookStock
  })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('cart/add-book')
  async addBookToBasket(
    @Body() body: AddBookToCartDto,
    @CurrentUser('id') userId: string
  ) {
    return this.ordersService.addBookToBasket(userId, body);
  }
}
