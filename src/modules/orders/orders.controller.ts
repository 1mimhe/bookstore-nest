import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { UnprocessableEntityMessages } from 'src/common/enums/error.messages';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AddBookToCartDto } from './dto/add-book.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { CartResponseDto } from './dto/cart-response.dto';
import { RemoveBookFromCartDto } from './dto/remove-book.dto';
import { InitiateOrderDto } from './dto/initiate-order.dto';
import { SubmitOrderDto } from './dto/submit-order.dto';

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
    summary: 'Remove a book from a user’s cart',
    description: `Decreases the quantity of a specified book in the user's cart by the provided amount.
      If the book's quantity reaches zero, it is removed from the cart.
      Returns \`true\`, or \`false\` if the bookId or quantity is invalid.`
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('cart/remove-book')
  async removeBookFromCart(
    @Body() body: RemoveBookFromCartDto,
    @CurrentUser('id') userId: string
  ) {
    return this.ordersService.removeBookFromCart(userId, body);
  }

  @ApiOperation({
    summary: 'Clear user’s cart',
    description: 'The cart is automatically cleared after 48 hours of inactivity if no changes are made.'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('cart/clear')
  async clearCart(@CurrentUser('id') userId: string) {
    return this.ordersService.clearCart(userId);
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

  @ApiOperation({
    summary: 'Initiate an Order from Cart',
    description: `Creates a pending order based on the user's cart.
      The order is finalized as \`paid\`/\`unpaid\` upon payment confirmation via webhook.`,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  async initiateOrder(
    @Body() body: InitiateOrderDto,
    @CurrentUser('id') userId: string
  ) {
    return this.ordersService.initiateOrder(userId, body);
  }

  @ApiOperation({
    summary: 'Simulate Payment Confirmation for Order (MVP)',
    description: `A test webhook endpoint for simulating payment confirmation in an MVP environment.
      Accepts a payment status to update the order status. This endpoint is designed for testing purposes
      without a real payment gateway.`
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('submit')
  async submitOrder(
    @Body() body: SubmitOrderDto,
    @CurrentUser('id') userId: string
  ) {
    return this.ordersService.submitOrder(userId, body);
  }

  @ApiOperation({
    summary: 'Get all user\'s orders'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  async getAllOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.getAllOrders(userId);
  }
}
