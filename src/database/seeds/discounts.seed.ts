import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { DiscountCode, DiscountCodeType } from '../../modules/discount-codes/entities/discount-code.entity';
import { User } from '../../modules/users/entities/user.entity';
import { linkManyToMany, logResult, need, runStandalone, upsert } from './seed-utils';

const discountsData = [
  {
    code: 'WELCOME10',
    type: DiscountCodeType.Percentage,
    value: 0.1,
    usageLimit: 200,
    isActive: true,
    description: '10% off your first order — welcome to the bookstore!',
    linkUsers: ['demo', 'mehrdad', 'zahra'],
  },
  {
    code: 'FIXED50000',
    type: DiscountCodeType.FixedAmount,
    value: 50000,
    minPurchase: 300000,
    usageLimit: 100,
    isActive: true,
    description: '50,000 off orders above 300,000',
    linkUsers: ['kian'],
  },
  {
    code: 'NOROOZ1403',
    type: DiscountCodeType.Percentage,
    value: 0.15,
    usageLimit: 500,
    isActive: false,
    endDate: new Date('2024-04-01'),
    description: 'Expired Norouz campaign — 15% off for Persian New Year',
    linkUsers: [],
  },
  {
    code: 'SUMMER2024',
    type: DiscountCodeType.Percentage,
    value: 0.2,
    usageLimit: 300,
    isActive: true,
    description: '20% summer reading sale',
    linkUsers: ['taraneh', 'neda'],
  },
  {
    code: 'BIRTHDAY100',
    type: DiscountCodeType.FixedAmount,
    value: 100000,
    minPurchase: 500000,
    usageLimit: 50,
    isActive: true,
    description: '100,000 off orders above 500,000 — birthday special',
    linkUsers: [],
  },
  {
    code: 'POETRY20',
    type: DiscountCodeType.Percentage,
    value: 0.2,
    minPurchase: 100000,
    usageLimit: 150,
    isActive: true,
    description: '20% off poetry books — celebrate Persian literary heritage',
    linkUsers: ['demo'],
  },
  {
    code: 'STUDENT15',
    type: DiscountCodeType.Percentage,
    value: 0.15,
    usageLimit: 500,
    isActive: true,
    description: '15% student discount — verify your student ID',
    linkUsers: ['kian', 'neda'],
  },
  {
    code: 'BLACKFRIDAY',
    type: DiscountCodeType.Percentage,
    value: 0.3,
    usageLimit: 1000,
    isActive: false,
    endDate: new Date('2024-11-30'),
    description: '30% Black Friday mega sale — expired',
    linkUsers: [],
  },
  {
    code: 'FREESHIP',
    type: DiscountCodeType.FixedAmount,
    value: 60000,
    usageLimit: 200,
    isActive: true,
    description: 'Free shipping on any order — Peyk delivery included',
    linkUsers: ['mehrdad', 'demo'],
  },
  {
    code: 'VIP100',
    type: DiscountCodeType.FixedAmount,
    value: 100000,
    minPurchase: 800000,
    usageLimit: 20,
    isActive: true,
    description: '100,000 off premium orders — VIP exclusive',
    linkUsers: [],
  },
];

export async function seedDiscounts(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting discount codes seeding...');
  const discountRepo = ds.getRepository(DiscountCode);
  const userRepo = ds.getRepository(User);
  let created = 0;
  let updated = 0;

  for (const row of discountsData) {
    const { entity: code, created: isNew } = await upsert(
      discountRepo,
      { code: row.code },
      {
        code: row.code,
        type: row.type,
        value: row.value,
        minPurchase: row.minPurchase,
        usageLimit: row.usageLimit,
        isActive: row.isActive,
        endDate: row.endDate,
        description: row.description,
      },
    );
    if (isNew) {
      created++;
      console.log(`✅ Created discount code: ${row.code}`);
    } else {
      updated++;
    }

    for (const username of row.linkUsers) {
      const user = await need(userRepo, { username }, `user:${username}`);
      await linkManyToMany(ds, DiscountCode, 'users', code.id, [user.id]);
    }
  }

  logResult('Discount codes', created, updated);
  console.log('🎉 Discount codes seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('discounts', seedDiscounts).catch(() => process.exit(1));
}
