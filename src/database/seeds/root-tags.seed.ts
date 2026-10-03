import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { RootTag } from '../../modules/tags/entities/root-tag.entity';
import { Tag } from '../../modules/tags/entities/tag.entity';
import { logResult, runStandalone, upsert } from './seed-utils';

const rootTagsData = [
  { slug: 'fiction-literature', order: 1, topic: 'Genres' },
  { slug: 'poetry', order: 2, topic: 'Genres' },
  { slug: 'philosophy', order: 3, topic: 'Genres' },
  { slug: 'self-development', order: 4, topic: 'Genres' },
  { slug: 'psychology', order: 5, topic: 'Genres' },
  { slug: 'history', order: 6, topic: 'Genres' },
  { slug: 'nobel-literature', order: 7, topic: 'Awards' },
  { slug: 'man-booker', order: 8, topic: 'Awards' },
  { slug: 'pulitzer-fiction', order: 9, topic: 'Awards' },
  { slug: 'harry-potter', order: 10, topic: 'Series' },
  { slug: 'lord-of-the-rings', order: 11, topic: 'Series' },
  { slug: 'sherlock-holmes', order: 12, topic: 'Series' },
  { slug: 'bestsellers', order: 13, topic: 'Charts' },
  { slug: 'ny-times-bestsellers', order: 14, topic: 'Charts' },
  { slug: 'goodreads-choice', order: 15, topic: 'Charts' },
  { slug: 'teenagers', order: 16, topic: 'Age groups' },
  { slug: 'children', order: 17, topic: 'Age groups' },
  { slug: 'adults', order: 18, topic: 'Age groups' },
  { slug: 'iranian-literature', order: 19, topic: 'National' },
  { slug: 'russian-literature', order: 20, topic: 'National' },
  { slug: 'english-literature', order: 21, topic: 'National' },
  { slug: 'japanese-literature', order: 22, topic: 'National' },
  { slug: 'french-literature', order: 23, topic: 'National' },
  { slug: 'american-literature', order: 24, topic: 'National' },
];

export async function seedRootTags(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting root tags seeding...');
  const tagRepo = ds.getRepository(Tag);
  const rootRepo = ds.getRepository(RootTag);
  let created = 0;
  let updated = 0;

  for (const row of rootTagsData) {
    const tag = await tagRepo.findOne({ where: { slug: row.slug } });
    if (!tag) {
      console.log(`⚠️  Tag "${row.slug}" not found — run tags seeder first, skipping root entry`);
      continue;
    }
    const { created: isNew } = await upsert(
      rootRepo,
      { tagId: tag.id },
      { tagId: tag.id, order: row.order, topic: row.topic },
    );
    if (isNew) {
      created++;
      console.log(`✅ Created root tag: ${tag.name} (order ${row.order})`);
    } else {
      updated++;
    }
  }

  logResult('Root tags', created, updated);
  console.log('🎉 Root tags seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('root-tags', seedRootTags).catch(() => process.exit(1));
}
