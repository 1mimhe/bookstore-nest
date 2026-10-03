import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Language } from '../../modules/languages/entities/language.entity';
import { logResult, runStandalone, upsert } from './seed-utils';

const languagesData = [
  {
    code: 'fa',
    englishName: 'Persian',
    persianName: 'فارسی',
  },
  {
    code: 'en',
    englishName: 'English',
    persianName: 'انگلیسی',
  },
  {
    code: 'ar',
    englishName: 'Arabic',
    persianName: 'عربی',
  },
  {
    code: 'tr',
    englishName: 'Turkish',
    persianName: 'ترکی',
  },
  {
    code: 'az',
    englishName: 'Azerbaijani',
    persianName: 'آذربایجانی',
  },
  {
    code: 'ur',
    englishName: 'Urdu',
    persianName: 'اردو',
  },
  {
    code: 'fr',
    englishName: 'French',
    persianName: 'فرانسوی',
  },
  {
    code: 'de',
    englishName: 'German',
    persianName: 'آلمانی',
  },
  {
    code: 'es',
    englishName: 'Spanish',
    persianName: 'اسپانیایی',
  },
  {
    code: 'zh',
    englishName: 'Chinese',
    persianName: 'چینی',
  },
  {
    code: 'ru',
    englishName: 'Russian',
    persianName: 'روسی',
  },
  {
    code: 'it',
    englishName: 'Italian',
    persianName: 'ایتالیایی',
  },
  {
    code: 'ja',
    englishName: 'Japanese',
    persianName: 'ژاپنی',
  },
  {
    code: 'hi',
    englishName: 'Hindi',
    persianName: 'هندی',
  },
  {
    code: 'pt',
    englishName: 'Portuguese',
    persianName: 'پرتغالی',
  },
  {
    code: 'ps',
    englishName: 'Pashto',
    persianName: 'پشتو',
  },
];

export async function seedLanguages(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting languages seeding...');

  const languageRepository = ds.getRepository(Language);
  let created = 0;
  let updated = 0;

  // Upsert only — never delete, languages may be referenced by books.
  for (const languageData of languagesData) {
    const { created: isNew } = await upsert(
      languageRepository,
      { code: languageData.code },
      {
        code: languageData.code,
        englishName: languageData.englishName,
        persianName: languageData.persianName,
      },
    );
    if (isNew) {
      created++;
      console.log(`✅ Created language: ${languageData.englishName} (${languageData.code})`);
    } else {
      updated++;
    }
  }

  logResult('Languages', created, updated);
  console.log('🎉 Language seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('languages', seedLanguages).catch(() => process.exit(1));
}