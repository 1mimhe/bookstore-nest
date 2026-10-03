import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Publisher } from '../../modules/publishers/entities/publisher.entity';
import { RolesEnum } from '../../modules/users/entities/role.entity';
import { logResult, need, runStandalone, upsert } from './seed-utils';
import { ensureUser } from './users.seed';

const publishersData = [
  {
    publisherName: 'Cheshmeh',
    slug: 'cheshmeh',
    description: 'نشر چشمه — leading Persian publisher of literature and humanities. Founded in 1987, Cheshmeh has published over 3,000 titles spanning fiction, philosophy, social sciences, and translations of world classics.',
    username: 'publisher1',
    firstName: 'Negar',
    lastName: 'Hosseini',
    email: 'negar.hosseini@cheshmeh.com',
    phoneNumber: '+989121001002',
    views: 2800,
  },
  {
    publisherName: 'Nashr-e Nay',
    slug: 'nashr-nay',
    description: 'نشر نی — philosophy, social sciences and classic translations. One of Iran\'s most respected academic and literary publishers, known for rigorous editorial standards and beautiful typography.',
    username: 'saeed',
    firstName: 'Saeed',
    lastName: 'Taheri',
    email: 'saeed.taheri@nay.com',
    phoneNumber: '+989122002007',
    views: 1900,
  },
  {
    publisherName: 'Penguin Classics',
    slug: 'penguin-classics',
    description: 'English-language classics in collectible editions. Penguin Classics is the world\'s leading publisher of classic literature, offering over 1,500 titles from ancient epics to contemporary novels.',
    username: 'publisher-penguin',
    firstName: 'Oliver',
    lastName: 'Bennett',
    email: 'oliver.bennett@penguin.com',
    phoneNumber: '+989123003001',
    views: 2400,
  },
  {
    publisherName: 'HarperCollins',
    slug: 'harper-collins',
    description: 'International trade publisher; home of Tolkien editions. One of the world\'s largest publishing houses, HarperCollins has published 200+ Nobel Prize winners and countless bestsellers.',
    username: 'publisher-harper',
    firstName: 'Charlotte',
    lastName: 'Evans',
    email: 'charlotte.evans@harpercollins.com',
    phoneNumber: '+989123003002',
    views: 1600,
  },
  {
    publisherName: 'Amir Kabir',
    slug: 'amir-kabir',
    description: 'ناشر امیرکبیر — one of Iran\'s oldest publishers, specializing in classic Persian literature and academic works. Named after the great Iranian reformer, with a catalogue spanning 40 years.',
    username: 'publisher-amirkabir',
    firstName: 'Bahram',
    lastName: 'Shirazi',
    email: 'bahram.shirazi@amirkabir.com',
    phoneNumber: '+989123003003',
    views: 1400,
  },
  {
    publisherName: 'Nashr-e Markaz',
    slug: 'nashr-markaz',
    description: 'نشر مرکز — independent publisher focused on contemporary fiction, translation, and cultural criticism. Known for discovering new Persian literary voices.',
    username: 'publisher-markaz',
    firstName: 'Leila',
    lastName: 'Farjad',
    email: 'leila.farjad@markaz.com',
    phoneNumber: '+989123003004',
    views: 1100,
  },
  {
    publisherName: 'Random House',
    slug: 'random-house',
    description: 'Major English-language publisher, home to contemporary bestsellers and literary fiction. With over 17,000 titles annually, it is one of the largest trade book publishers in the world.',
    username: 'publisher-random',
    firstName: 'James',
    lastName: 'Crawford',
    email: 'james.crawford@randomhouse.com',
    phoneNumber: '+989123003005',
    views: 2000,
  },
  {
    publisherName: 'Susa',
    slug: 'susa',
    description: 'انتشارات سُوَس — specialist in Iranian poetry and literary criticism. Known for scholarly editions of classical Persian poets and modern literary theory.',
    username: 'publisher-susa',
    firstName: 'Parisa',
    lastName: 'Navid',
    email: 'parisa.navid@susa.com',
    phoneNumber: '+989123003006',
    views: 800,
  },
];

export async function seedPublishers(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting publishers seeding...');
  const publisherRepo = ds.getRepository(Publisher);
  let created = 0;
  let updated = 0;

  for (const row of publishersData) {
    const user = await ensureUser(ds, {
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phoneNumber: row.phoneNumber,
      roles: [RolesEnum.Publisher, RolesEnum.Customer],
    });

    const { created: isNew } = await upsert(
      publisherRepo,
      { publisherName: row.publisherName },
      {
        publisherName: row.publisherName,
        slug: row.slug,
        description: row.description,
        userId: user.id,
        views: row.views,
      },
    );
    if (isNew) {
      created++;
      console.log(`✅ Created publisher: ${row.publisherName}`);
    } else {
      const existing = await need(
        publisherRepo,
        { publisherName: row.publisherName },
        `publisher:${row.publisherName}`,
      );
      if (existing.userId !== user.id) {
        await publisherRepo.update(existing.id, { userId: user.id });
      }
      updated++;
    }
  }

  logResult('Publishers', created, updated);
  console.log('🎉 Publishers seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('publishers', seedPublishers).catch(() => process.exit(1));
}
