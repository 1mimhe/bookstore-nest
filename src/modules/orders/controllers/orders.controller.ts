import { Body, Controller, DefaultValuePipe, Get, HttpCode, HttpStatus, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { UnprocessableEntityMessages } from 'src/common/enums/error.messages';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AddBookToCartDto } from '../dtos/add-book.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { CartResponseDto } from '../dtos/cart-response.dto';
import { RemoveBookFromCartDto } from '../dtos/remove-book.dto';
import { InitiateOrderDto } from '../dtos/initiate-order.dto';
import { SubmitOrderDto } from '../dtos/submit-order.dto';
import { ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { OrderResponseDto } from '../dtos/order-response.dto';

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
    description: `Creates a pending order based on the user's cart and opens a payment session.
      Returns the order (with \`orderNumber\` and \`payablePrice\`) plus the payment
      reference and checkout URL. The order is finalized only after the payment
      is verified server-side via \`POST /orders/submit\`.`,
  })
  @ApiOkResponse({
    type: OrderResponseDto
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
    summary: 'Verify payment and finalize the order',
    description: `Submits the payment reference returned by the payment session for server-side
      verification. The order is finalized as \`paid\` only when the gateway confirms
      the transaction amount; otherwise it is canceled with a 400 response.
      The legacy client-supplied \`status\` field has been removed for security.`
  })
  @ApiOkResponse({
    type: OrderResponseDto
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
  @ApiOkResponse({
    type: [OrderResponseDto]
  })
  @ApiBearerAuth()
  @ApiQueryPagination()
  @UseGuards(AuthGuard)
  @Serialize(OrderResponseDto)
  @Get()
  async getAllOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @CurrentUser('id') userId: string
  ) {
    return this.ordersService.getAllOrders(userId, page, limit);
  }
}
