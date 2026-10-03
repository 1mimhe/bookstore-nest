import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Book } from '../../modules/books/entities/book.entity';
import { Title } from '../../modules/books/entities/title.entity';
import { Collection } from '../../modules/collections/entities/collection.entity';
import { CollectionBook } from '../../modules/collections/entities/collection-book.entity';
import { User } from '../../modules/users/entities/user.entity';
import { logResult, need, runStandalone, upsert } from './seed-utils';

interface CollectionSpec {
  name: string;
  slug: string;
  description: string;
  isPublic: boolean;
  ownerUsername?: string;
  titleSlugs: string[];
}

const collectionsData: CollectionSpec[] = [
  {
    name: 'Russian Classics',
    slug: 'russian-classics',
    description: 'The heavyweights: Dostoevsky, Tolstoy, and the moral abyss. Essential reading for anyone who wants to understand the human condition.',
    isPublic: true,
    titleSlugs: ['crime-and-punishment', 'the-brothers-karamazov'],
  },
  {
    name: 'Mystery Masters',
    slug: 'mystery-masters',
    description: 'Christie at her most cunning — trains, islands, and Poirot. The definitive collection of Golden Age detective fiction.',
    isPublic: true,
    titleSlugs: ['murder-on-the-orient-express', 'and-then-there-were-none'],
  },
  {
    name: 'Demo\'s Shelf',
    slug: 'demos-shelf',
    description: 'A private shelf of the demo customer. Featuring dystopian fiction and melancholic Japanese literature.',
    isPublic: false,
    ownerUsername: 'demo',
    titleSlugs: ['1984', 'norwegian-wood', 'the-stranger'],
  },
  {
    name: 'Winter Staff Picks',
    slug: 'winter-staff-picks',
    description: 'What our editors press into your hands this winter. Curl up with these on a cold night.',
    isPublic: true,
    titleSlugs: ['the-hobbit', 'the-blind-owl', 'animal-farm', 'the-metamorphosis'],
  },
  {
    name: 'Fresh on the Shelf',
    slug: 'fresh-on-the-shelf',
    description: 'New arrivals: epics, mysteries of the soul, and a boy wizard. Don\'t miss these.',
    isPublic: true,
    titleSlugs: ['the-brothers-karamazov', 'the-lord-of-the-rings', 'harry-potter-1', 'the-little-prince'],
  },
  {
    name: 'Persian Poetry Essentials',
    slug: 'persian-poetry-essentials',
    description: 'From Shahnameh to Forough: the poems that define Iranian literary identity.',
    isPublic: true,
    titleSlugs: ['shahnameh', 'divan-e-hafez', 'another-birth'],
  },
  {
    name: 'Existentialism 101',
    slug: 'existentialism-101',
    description: 'Camus, Kafka, Kundera, and de Beauvoir — your crash course in existentialist fiction and philosophy.',
    isPublic: true,
    titleSlugs: ['the-stranger', 'the-metamorphosis', 'the-unbearable-lightness-of-being', 'the-second-sex'],
  },
  {
    name: 'Fantasy & Adventure',
    slug: 'fantasy-adventure',
    description: 'Middle-earth, Hogwarts, and beyond. The books that transport you to other worlds.',
    isPublic: true,
    titleSlugs: ['the-hobbit', 'the-lord-of-the-rings', 'harry-potter-1'],
  },
  {
    name: 'The Great Gatsby Collection',
    slug: 'gatsby-collection',
    description: 'American classics exploring the dream, the jazz age, and moral courage.',
    isPublic: true,
    titleSlugs: ['the-great-gatsby', 'to-kill-a-mockingbird'],
  },
  {
    name: 'Zahra\'s Reading Log',
    slug: 'zahras-reading-log',
    description: 'Books Zahra has read or wants to read. A personal reading journey.',
    isPublic: false,
    ownerUsername: 'zahra',
    titleSlugs: ['pride-and-prejudice', 'the-little-prince', 'one-hundred-years-of-solitude'],
  },
  {
    name: 'Kian\'s Must-Reads',
    slug: 'kians-must-reads',
    description: 'Essential reading for a Shiraz literature student.',
    isPublic: false,
    ownerUsername: 'kian',
    titleSlugs: ['the-stranger', '1984', 'the-metamorphosis', 'the-blind-owl'],
  },
  {
    name: 'International Bestsellers',
    slug: 'international-bestsellers',
    description: 'Books that conquered the world. From Tehran to Tokyo to New York.',
    isPublic: true,
    titleSlugs: ['the-alchemist', 'the-little-prince', 'harry-potter-1', 'one-hundred-years-of-solitude', 'the-girl-with-the-dragon-tattoo'],
  },
];

export async function seedCollections(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting collections seeding...');
  const collectionRepo = ds.getRepository(Collection);
  const entryRepo = ds.getRepository(CollectionBook);
  const titleRepo = ds.getRepository(Title);
  const bookRepo = ds.getRepository(Book);
  const userRepo = ds.getRepository(User);
  let created = 0;
  let updated = 0;

  for (const spec of collectionsData) {
    const owner = spec.ownerUsername
      ? await need(userRepo, { username: spec.ownerUsername }, `user:${spec.ownerUsername}`)
      : undefined;

    const { entity: collection, created: isNew } = await upsert(
      collectionRepo,
      { slug: spec.slug },
      {
        name: spec.name,
        slug: spec.slug,
        description: spec.description,
        isPublic: spec.isPublic,
        userId: owner?.id,
      },
    );
    if (isNew) {
      created++;
      console.log(`✅ Created collection: ${spec.name}`);
    } else {
      updated++;
    }

    let order = 1;
    for (const titleSlug of spec.titleSlugs) {
      const title = await need(titleRepo, { slug: titleSlug }, `title:${titleSlug}`);
      if (!title.defaultBookId) {
        console.log(`⚠️  Title "${titleSlug}" has no default book yet — run books seeder first`);
        continue;
      }
      const book = await need(bookRepo, { id: title.defaultBookId }, `book:${title.defaultBookId}`);
      await upsert(
        entryRepo,
        { collectionId: collection.id, bookId: book.id },
        {
          collectionId: collection.id,
          bookId: book.id,
          order: order++,
          description: `${title.name} — default edition`,
        },
      );
    }
  }

  logResult('Collections', created, updated);
  console.log('🎉 Collections seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('collections', seedCollections).catch(() => process.exit(1));
}
