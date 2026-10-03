import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Book } from '../../modules/books/entities/book.entity';
import {
  Order,
  OrderStatuses,
  PaymentStatuses,
  ShippingTypes,
} from '../../modules/orders/entities/order.entity';
import { OrderBook } from '../../modules/orders/entities/order-book.entity';
import { ShippingPrice } from '../../modules/orders/entities/shipping-price.entity';
import { Address } from '../../modules/users/entities/address.entity';
import { User } from '../../modules/users/entities/user.entity';
import { logResult, need, runStandalone } from './seed-utils';

interface OrderItemSpec {
  isbn: string;
  quantity: number;
}

interface OrderSpec {
  trackingCode: string;
  paymentId: string;
  paymentStatus: PaymentStatuses;
  orderStatus: OrderStatuses;
  shippingType: ShippingTypes;
  discountCode?: string;
  discountRate?: number;
  items: OrderItemSpec[];
}

const ordersData: OrderSpec[] = [
  {
    trackingCode: 'TRK-100001',
    paymentId: 'PAY-100001',
    paymentStatus: PaymentStatuses.Paid,
    orderStatus: OrderStatuses.Delivered,
    shippingType: ShippingTypes.Post,
    discountCode: 'WELCOME10',
    discountRate: 0.1,
    items: [
      { isbn: '9786221000051', quantity: 2 },
      { isbn: '9786221000150', quantity: 1 },
    ],
  },
  {
    trackingCode: 'TRK-100002',
    paymentId: 'PAY-100002',
    paymentStatus: PaymentStatuses.Pending,
    orderStatus: OrderStatuses.Pending,
    shippingType: ShippingTypes.Tipax,
    discountRate: 0,
    items: [{ isbn: '9786221000136', quantity: 1 }],
  },
  {
    trackingCode: 'TRK-100003',
    paymentId: 'PAY-100003',
    paymentStatus: PaymentStatuses.Paid,
    orderStatus: OrderStatuses.Shipped,
    shippingType: ShippingTypes.Peyk,
    items: [
      { isbn: '9786221000013', quantity: 1 },
      { isbn: '9786221000037', quantity: 1 },
      { isbn: '9786221000273', quantity: 2 },
    ],
  },
  {
    trackingCode: 'TRK-100004',
    paymentId: 'PAY-100004',
    paymentStatus: PaymentStatuses.Paid,
    orderStatus: OrderStatuses.Delivered,
    shippingType: ShippingTypes.Post,
    discountCode: 'FIXED50000',
    discountRate: 0,
    items: [
      { isbn: '9786221000341', quantity: 1 },
      { isbn: '9780008322069', quantity: 1 },
    ],
  },
  {
    trackingCode: 'TRK-100005',
    paymentId: 'PAY-100005',
    paymentStatus: PaymentStatuses.Paid,
    orderStatus: OrderStatuses.Processing,
    shippingType: ShippingTypes.Tipax,
    discountRate: 0,
    items: [
      { isbn: '9786221000365', quantity: 1 },
      { isbn: '9780007487240', quantity: 1 },
    ],
  },
  {
    trackingCode: 'TRK-100006',
    paymentId: 'PAY-100006',
    paymentStatus: PaymentStatuses.Unpaid,
    orderStatus: OrderStatuses.Returned,
    shippingType: ShippingTypes.Post,
    items: [{ isbn: '9786221000235', quantity: 1 }],
  },
  {
    trackingCode: 'TRK-100007',
    paymentId: 'PAY-100007',
    paymentStatus: PaymentStatuses.Paid,
    orderStatus: OrderStatuses.Delivered,
    shippingType: ShippingTypes.Post,
    discountCode: 'WELCOME10',
    discountRate: 0.1,
    items: [
      { isbn: '9786221000389', quantity: 3 },
      { isbn: '9786221000372', quantity: 2 },
    ],
  },
  {
    trackingCode: 'TRK-100008',
    paymentId: 'PAY-100008',
    paymentStatus: PaymentStatuses.Paid,
    orderStatus: OrderStatuses.Shipped,
    shippingType: ShippingTypes.Peyk,
    items: [
      { isbn: '9786221000013', quantity: 1 },
      { isbn: '9786221000211', quantity: 1 },
      { isbn: '9786221000174', quantity: 1 },
    ],
  },
];

export async function seedOrders(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting orders seeding...');
  const orderRepo = ds.getRepository(Order);
  const itemRepo = ds.getRepository(OrderBook);
  const userRepo = ds.getRepository(User);
  const addressRepo = ds.getRepository(Address);
  const bookRepo = ds.getRepository(Book);
  const shippingRepo = ds.getRepository(ShippingPrice);
  let created = 0;
  let updated = 0;

  const demo = await need(userRepo, { username: 'demo' }, 'user:demo');
  const mehrdad = await need(userRepo, { username: 'mehrdad' }, 'user:mehrdad');

  const demoAddress = await need(
    addressRepo,
    { userId: demo.id, recipientName: 'Home' },
    'address:demo/Home',
  );
  const mehrdadAddress = await need(
    addressRepo,
    { userId: mehrdad.id, recipientName: 'Home' },
    'address:mehrdad/Home',
  );

  const users = [demo, mehrdad];
  const addresses = [demoAddress, mehrdadAddress];

  for (let i = 0; i < ordersData.length; i++) {
    const spec = ordersData[i];
    const user = users[i % users.length];
    const address = addresses[i % addresses.length];

    const shipping = await need(
      shippingRepo,
      { type: spec.shippingType },
      `shipping:${spec.shippingType}`,
    );

    let total = 0;
    const lines: { book: Book; quantity: number }[] = [];
    for (const item of spec.items) {
      const book = await need(bookRepo, { ISBN: item.isbn }, `book:${item.isbn}`);
      total += book.price * item.quantity;
      lines.push({ book, quantity: item.quantity });
    }
    const discountAmount = Math.round(total * (spec.discountRate ?? 0));
    const finalPrice = total - discountAmount + shipping.price;

    let order = await orderRepo.findOne({ where: { trackingCode: spec.trackingCode } });
    if (!order) {
      order = await orderRepo.save(
        orderRepo.create({
          userId: user.id,
          shippingAddressId: address.id,
          paymentStatus: spec.paymentStatus,
          orderStatus: spec.orderStatus,
          shippingType: spec.shippingType,
          shippingPrice: shipping.price,
          discountCode: spec.discountCode,
          totalPrice: total,
          discountAmount,
          finalPrice,
          paymentId: spec.paymentId,
          trackingCode: spec.trackingCode,
        }),
      );
      created++;
      console.log(`✅ Created order: ${spec.trackingCode} (final ${finalPrice})`);
    } else {
      await orderRepo.update(order.id, {
        paymentStatus: spec.paymentStatus,
        orderStatus: spec.orderStatus,
        shippingPrice: shipping.price,
        totalPrice: total,
        discountAmount,
        finalPrice,
      });
      updated++;
    }

    for (const line of lines) {
      const existing = await itemRepo.findOne({
        where: { orderId: order.id, bookId: line.book.id },
      });
      if (!existing) {
        await itemRepo.save(
          itemRepo.create({
            orderId: order.id,
            bookId: line.book.id,
            quantity: line.quantity,
            discountPercent: line.book.discountPercent ?? 0,
            price: line.book.price,
          }),
        );
      }
    }
  }

  logResult('Orders', created, updated);
  console.log('🎉 Orders seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('orders', seedOrders).catch(() => process.exit(1));
}
