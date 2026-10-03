import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { seedAdmin } from './admin.seed';
import { seedAuthors } from './authors.seed';
import { seedBlogs } from './blogs.seed';
import { seedBookmarks } from './bookmarks.seed';
import { seedBooks } from './books.seed';
import { seedCharacters } from './characters.seed';
import { seedCollections } from './collections.seed';
import { seedDiscounts } from './discounts.seed';
import { seedLanguages } from './languages.seed';
import { seedOrders } from './orders.seed';
import { seedPublishers } from './publishers.seed';
import { seedReviews } from './reviews.seed';
import { seedRootTags } from './root-tags.seed';
import { seedShippingPrices } from './shipping-prices.seed';
import { seedStaff } from './staff.seed';
import { seedStaffActions } from './staff-actions.seed';
import { seedTags } from './tags.seed';
import { seedTickets } from './tickets.seed';
import { seedTitles } from './titles.seed';
import { seedUsers } from './users.seed';

interface SeedStep {
  name: string;
  fn: (ds: DataSource) => Promise<void>;
}

const foundation: SeedStep[] = [
  { name: 'Languages', fn: seedLanguages },
  { name: 'Tags', fn: seedTags },
  { name: 'Admin user', fn: seedAdmin },
  { name: 'Demo users', fn: seedUsers },
  { name: 'Staff', fn: seedStaff },
];

const catalog: SeedStep[] = [
  { name: 'Authors', fn: seedAuthors },
  { name: 'Publishers', fn: seedPublishers },
  { name: 'Characters', fn: seedCharacters },
  { name: 'Root tags', fn: seedRootTags },
  { name: 'Titles', fn: seedTitles },
  { name: 'Books', fn: seedBooks },
];

const content: SeedStep[] = [
  { name: 'Blogs', fn: seedBlogs },
  { name: 'Collections', fn: seedCollections },
];

const shop: SeedStep[] = [
  { name: 'Discount codes', fn: seedDiscounts },
  { name: 'Shipping prices', fn: seedShippingPrices },
  { name: 'Orders', fn: seedOrders },
];

const activity: SeedStep[] = [
  { name: 'Reviews', fn: seedReviews },
  { name: 'Bookmarks', fn: seedBookmarks },
  { name: 'Tickets', fn: seedTickets },
  { name: 'Staff actions', fn: seedStaffActions },
];

const groups: Record<string, SeedStep[]> = {
  all: [...foundation, ...catalog, ...content, ...shop, ...activity],
  users: [...foundation],
  catalog,
  content,
  shop,
  activity,
};

async function main(): Promise<void> {
  const group = process.argv[2] ?? 'all';
  const steps = groups[group];
  if (!steps) {
    console.error(`❌ Unknown seed group "${group}". Available: ${Object.keys(groups).join(', ')}`);
    process.exit(1);
  }

  console.log(`🚀 Running database seeding pipeline (group: ${group})...\n`);
  await AppDataSource.initialize();
  console.log('📦 Database connected\n');

  try {
    let i = 0;
    for (const step of steps) {
      i++;
      console.log(`\n${i}️⃣  Seeding ${step.name}...`);
      await step.fn(AppDataSource);
    }
    console.log('\n✨ All database seeds executed successfully!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Seeding failed:', error);
    try {
      await AppDataSource.destroy();
    } catch {
      // ignore cleanup errors
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(() => process.exit(1));
}
