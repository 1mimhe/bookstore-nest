import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { UnprocessableEntityMessages } from 'src/common/enums/error.messages';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AddBookToCartDto } from './dto/add-book.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { CartResponseDto } from './dto/cart-response.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @ApiOperation({
    summary: 'Add a book to a user’s cart',
    description: `Adds a specified quantity of a book to the user's cart. If the book already exists in the cart, 
      the requested quantity is added to the existing quantity.`
  })
  @ApiUnprocessableEntityResponse({
    description: UnprocessableEntityMessages.BookStock
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('cart/add-book')
  async addBookToCart(
    @Body() body: AddBookToCartDto,
    @CurrentUser('id') userId: string
  ) {
    return this.ordersService.addBookToCart(userId, body);
  }

  @ApiOperation({
    summary: 'Retrieve a user’s cart',
    description: `For each book, if the requested quantity exceeds the available stock (even if stock is not zero),
      the book is added to the unprocessables array, and the quantity is reduced to the available stock.`
  })
  @ApiOkResponse({
    type: CartResponseDto
  })
  @ApiBearerAuth()
  @Serialize(CartResponseDto)
  @UseGuards(AuthGuard)
  @Get('cart')
  async getCart(@CurrentUser('id') userId: string) {
    return this.ordersService.getCart(userId);
  }
}
