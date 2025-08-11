import { DataSource, Repository } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Define the Language entity inline to avoid import issues
@Entity('languages')
class Language {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 10 })
  code: string;

  @Column({ length: 100 })
  englishName: string;

  @Column({ length: 100 })
  persianName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

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

async function seedLanguages() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'mysql',
    database: 'bookstore-db',
    entities: [Language],
    synchronize: false,
  });

  console.log('🌱 Starting languages seeding...');
  
  const languageRepository = dataSource.getRepository(Language);
  try {
    await dataSource.initialize();
    console.log('📦 Database connected');

    
    // Safe deletion with existence check
    await safeDeleteLanguages(languageRepository);
    
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

async function safeDeleteLanguages(languageRepository: Repository<Language>) {
  try {
    // Method 1: Use DELETE query (respects foreign keys)
    const result = await languageRepository.createQueryBuilder()
      .delete()
      .from(Language)
      .execute();
    
    console.log(`🗑️  Deleted ${result.affected || 0} existing languages`);
    
  } catch (error) {
    // If deletion fails due to foreign key constraints, 
    // it means there are books referencing languages
    console.log('⚠️  Cannot delete languages that are referenced by books');
    console.log('   Consider updating/deleting books first or use upsert instead');
    
    // Alternative: Just proceed with insert/update (upsert)
    throw new Error('Cannot clear languages table due to foreign key constraints. Use upsert instead.');
  }
}


// Run the seeder
seedLanguages()
  .then(() => {
    console.log('✨ Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  });