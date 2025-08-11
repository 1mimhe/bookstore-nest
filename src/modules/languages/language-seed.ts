import { DataSource } from 'typeorm';
import { Language } from './language.entity';

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

export async function seedLanguages(dataSource: DataSource) {
  console.log('🌱 Starting languages seeding...');

  try {
    const languageRepository = dataSource.getRepository(Language);

    // Clear existing data
    await languageRepository.delete({});

    // Seed languages
    for (const languageData of languagesData) {
      const language = languageRepository.create({
        code: languageData.code,
        englishName: languageData.englishName,
        persianName: languageData.persianName,
      });
      await languageRepository.save(language);
      console.log(`✅ Created language: ${language.englishName} (${language.code})`);
    }

    console.log('🎉 Language seeding completed successfully!');
  } catch (error) {
    console.error('❌ Language seeding failed:', error);
    throw error;
  }
}
