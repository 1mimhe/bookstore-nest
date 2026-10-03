import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Book } from '../../modules/books/entities/book.entity';
import { Title } from '../../modules/books/entities/title.entity';
import { DiscountCode } from '../../modules/discount-codes/entities/discount-code.entity';
import { Order } from '../../modules/orders/entities/order.entity';
import { Review } from '../../modules/reviews/entities/review.entity';
import {
  EntityTypes,
  StaffAction,
  StaffActionStatus,
  StaffActionTypes,
} from '../../modules/staffs/entities/staff-action.entity';
import { Staff } from '../../modules/staffs/entities/staff.entity';
import { User } from '../../modules/users/entities/user.entity';
import { logResult, need, runStandalone } from './seed-utils';

export async function seedStaffActions(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting staff actions seeding...');
  const actionRepo = ds.getRepository(StaffAction);
  const staffRepo = ds.getRepository(Staff);
  const userRepo = ds.getRepository(User);
  let created = 0;
  let skipped = 0;

  const editorUser = await need(userRepo, { username: 'editor' }, 'user:editor');
  const keeperUser = await need(userRepo, { username: 'keeper' }, 'user:keeper');
  const supporterUser = await need(userRepo, { username: 'supporter' }, 'user:supporter');
  const arashUser = await need(userRepo, { username: 'arash' }, 'user:arash');
  const editor = await need(staffRepo, { userId: editorUser.id }, 'staff:editor');
  const keeper = await need(staffRepo, { userId: keeperUser.id }, 'staff:keeper');
  const supporter = await need(staffRepo, { userId: supporterUser.id }, 'staff:supporter');
  const arash = await need(staffRepo, { userId: arashUser.id }, 'staff:arash');

  const titleRepo = ds.getRepository(Title);
  const bookRepo = ds.getRepository(Book);
  const discountRepo = ds.getRepository(DiscountCode);
  const reviewRepo = ds.getRepository(Review);
  const orderRepo = ds.getRepository(Order);

  const crimeTitle = await titleRepo.findOne({ where: { slug: 'crime-and-punishment' } });
  const crimeBook = await bookRepo.findOne({ where: { ISBN: '9786221000013' } });
  const book1984 = await bookRepo.findOne({ where: { ISBN: '9786221000051' } });
  const hobbitBook = await bookRepo.findOne({ where: { ISBN: '9786221000136' } });
  const karamazovBook = await bookRepo.findOne({ where: { ISBN: '9786221000211' } });
  const discount1 = await discountRepo.findOne({ where: { code: 'WELCOME10' } });
  const discount2 = await discountRepo.findOne({ where: { code: 'SUMMER2024' } });
  const review = await reviewRepo.findOne({ where: {} });
  const order1 = await orderRepo.findOne({ where: { trackingCode: 'TRK-100001' } });
  const order3 = await orderRepo.findOne({ where: { trackingCode: 'TRK-100003' } });
  const order5 = await orderRepo.findOne({ where: { trackingCode: 'TRK-100005' } });

  const actionsData = [
    {
      staff: editor,
      type: StaffActionTypes.TitleCreated,
      entityType: EntityTypes.Title,
      entityId: crimeTitle?.id,
      description: 'Seeded showcase title Crime and Punishment — Cheshmeh 3rd edition',
    },
    {
      staff: editor,
      type: StaffActionTypes.BookCreated,
      entityType: EntityTypes.Book,
      entityId: crimeBook?.id,
      description: 'Added Persian edition of Crime and Punishment (Behazin translation)',
      newValue: crimeBook ? { price: crimeBook.price, stock: crimeBook.stock } : undefined,
    },
    {
      staff: keeper,
      type: StaffActionTypes.StockUpdated,
      entityType: EntityTypes.Book,
      entityId: crimeBook?.id,
      description: 'Opening stock count after inventory audit — 24 copies',
      oldValue: crimeBook ? { stock: 0 } : undefined,
      newValue: crimeBook ? { stock: 24 } : undefined,
    },
    {
      staff: keeper,
      type: StaffActionTypes.StockUpdated,
      entityType: EntityTypes.Book,
      entityId: book1984?.id,
      description: 'Restocked 1984 Persian edition — 40 copies added',
      newValue: book1984 ? { stock: book1984.stock } : undefined,
    },
    {
      staff: keeper,
      type: StaffActionTypes.StockUpdated,
      entityType: EntityTypes.Book,
      entityId: hobbitBook?.id,
      description: 'Inventory check: The Hobbit in good supply',
      newValue: hobbitBook ? { stock: hobbitBook.stock } : undefined,
    },
    {
      staff: editor,
      type: StaffActionTypes.DiscountCodeCreated,
      entityType: EntityTypes.DiscountCode,
      entityId: discount1?.id,
      description: 'Created WELCOME10 — 10% welcome discount for new customers',
    },
    {
      staff: editor,
      type: StaffActionTypes.DiscountCodeCreated,
      entityType: EntityTypes.DiscountCode,
      entityId: discount2?.id,
      description: 'Created SUMMER2024 — 20% summer reading sale',
    },
    {
      staff: editor,
      type: StaffActionTypes.ReviewModerated,
      entityType: EntityTypes.Review,
      entityId: review?.id,
      description: 'Approved seeded review — positive feedback on Crime and Punishment',
    },
    {
      staff: supporter,
      type: StaffActionTypes.OrderShipped,
      entityType: EntityTypes.Order,
      entityId: order1?.id,
      description: 'Order TRK-100001 shipped via Post — delivered successfully',
    },
    {
      staff: supporter,
      type: StaffActionTypes.OrderShipped,
      entityType: EntityTypes.Order,
      entityId: order3?.id,
      description: 'Order TRK-100003 shipped via Peyk — in transit',
    },
    {
      staff: supporter,
      type: StaffActionTypes.OrderShipped,
      entityType: EntityTypes.Order,
      entityId: order5?.id,
      description: 'Order TRK-100005 shipped via Tipax — out for delivery',
    },
    {
      staff: arash,
      type: StaffActionTypes.TitleCreated,
      entityType: EntityTypes.Title,
      entityId: crimeTitle?.id,
      description: 'Updated title metadata and added new tags for Crime and Punishment',
    },
    {
      staff: editor,
      type: StaffActionTypes.BookCreated,
      entityType: EntityTypes.Book,
      entityId: karamazovBook?.id,
      description: 'Added Brothers Karamazov Persian edition — Behazin translation',
      newValue: karamazovBook ? { price: karamazovBook.price, stock: karamazovBook.stock } : undefined,
    },
    {
      staff: keeper,
      type: StaffActionTypes.StockUpdated,
      entityType: EntityTypes.Book,
      entityId: karamazovBook?.id,
      description: 'Initial stock for Brothers Karamazov — 20 copies',
      newValue: karamazovBook ? { stock: karamazovBook.stock } : undefined,
    },
    {
      staff: supporter,
      type: StaffActionTypes.OrderShipped,
      entityType: EntityTypes.Order,
      entityId: order1?.id,
      description: 'Resolved late delivery complaint for TRK-100001 — issued voucher',
    },
    {
      staff: arash,
      type: StaffActionTypes.ReviewModerated,
      entityType: EntityTypes.Review,
      entityId: review?.id,
      description: 'Reviewed and approved customer feedback batch — 5 new reviews',
    },
  ];

  for (const row of actionsData) {
    if (!row.entityId) {
      console.log(`⚠️  Skipping ${row.type}: referenced entity not seeded yet`);
      skipped++;
      continue;
    }
    const existing = await actionRepo.findOne({
      where: { staffId: row.staff.id, type: row.type, entityId: row.entityId },
    });
    if (existing) {
      skipped++;
      continue;
    }
    await actionRepo.save(
      actionRepo.create({
        userId: row.staff.userId,
        staffId: row.staff.id,
        type: row.type,
        entityId: row.entityId,
        entityType: row.entityType,
        status: StaffActionStatus.Success,
        description: row.description,
        oldValue: row.oldValue,
        newValue: row.newValue,
      }),
    );
    created++;
    console.log(`✅ Logged staff action: ${row.type}`);
  }

  logResult('Staff actions', created, skipped);
  console.log('🎉 Staff actions seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('staff-actions', seedStaffActions).catch(() => process.exit(1));
}
