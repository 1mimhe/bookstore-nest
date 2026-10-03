import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Author } from '../../modules/authors/entities/author.entity';
import { logResult, runStandalone, upsert } from './seed-utils';

const authorsData = [
  {
    firstName: 'Fyodor',
    lastName: 'Dostoevsky',
    slug: 'fyodor-dostoevsky',
    biography: 'Russian novelist of Crime and Punishment and The Brothers Karamazov. His exploration of human psychology, morality, and the troubled social, political, and spiritual atmospheres of 19th-century Russia has made him one of the most widely read and influential writers in world literature.',
    dateOfBirth: new Date('1821-11-11'),
    dateOfDeath: new Date('1881-02-09'),
    views: 5200,
  },
  {
    firstName: 'Jane',
    lastName: 'Austen',
    slug: 'jane-austen',
    biography: 'English novelist known for Pride and Prejudice and Sense and Sensibility. Her works of romantic fiction among the most popular in the English language, earning her a place among the most widely read writers in English literature. Her plots often explore the dependence of women on marriage in the pursuit of favourable social standing and economic security.',
    dateOfBirth: new Date('1775-12-16'),
    dateOfDeath: new Date('1817-07-18'),
    views: 4300,
  },
  {
    firstName: 'George',
    lastName: 'Orwell',
    slug: 'george-orwell',
    biography: 'English author of 1984 and Animal Farm; master of political satire. His work is characterised by lucid prose, social criticism, opposition to totalitarianism, and support of democratic socialism. Orwell\'s literary career spanned fiction, poetry, and journalism.',
    dateOfBirth: new Date('1903-06-25'),
    dateOfDeath: new Date('1950-01-21'),
    views: 6100,
  },
  {
    firstName: 'Agatha',
    lastName: 'Christie',
    slug: 'agatha-christie',
    biography: 'Queen of mystery; creator of Hercule Poirot and Miss Marple. The best-selling fiction writer of all time, her works have sold over two billion copies worldwide. She also wrote the world\'s longest-running play, The Mousetrap.',
    dateOfBirth: new Date('1890-09-15'),
    dateOfDeath: new Date('1976-01-12'),
    views: 4800,
  },
  {
    firstName: 'Haruki',
    lastName: 'Murakami',
    slug: 'haruki-murakami',
    biography: 'Japanese writer blending the mundane with the surreal. His novels, essays, and short stories have earned him numerous Japanese and international literary awards. His work has been translated into over 50 languages.',
    dateOfBirth: new Date('1949-01-12'),
    views: 3900,
  },
  {
    firstName: 'Sadegh',
    lastName: 'Hedayat',
    slug: 'sadegh-hedayat',
    biography: 'Founder of modern Persian fiction; author of The Blind Owl. Considered the greatest Iranian writer of the 20th century, his works explore themes of existentialism, alienation, and the human condition through a uniquely Persian literary lens.',
    dateOfBirth: new Date('1903-02-17'),
    dateOfDeath: new Date('1951-04-09'),
    views: 3500,
  },
  {
    firstName: 'Forough',
    lastName: 'Farrokhzad',
    slug: 'forough-farrokhzad',
    biography: 'Influential modern Persian poet; author of Another Birth. She challenged the conventions of Persian poetry with her bold, confessional style and feminist perspective. Her work has profoundly influenced generations of Iranian poets.',
    dateOfBirth: new Date('1934-12-29'),
    dateOfDeath: new Date('1967-02-13'),
    views: 3100,
  },
  {
    firstName: 'John',
    lastName: 'Tolkien',
    nickname: 'J.R.R. Tolkien',
    slug: 'jrr-tolkien',
    biography: 'Creator of Middle-earth; author of The Hobbit and The Lord of the Rings. A professor of Anglo-Saxon at Oxford, Tolkien was a leading philologist who pioneered the modern fantasy genre with his meticulously constructed secondary world.',
    dateOfBirth: new Date('1892-01-03'),
    dateOfDeath: new Date('1973-09-02'),
    views: 5600,
  },
  {
    firstName: 'Mahmoud',
    lastName: "Etemadzadeh",
    nickname: 'Behazin',
    slug: 'behazin',
    biography: 'Renowned Persian translator of French and Russian literature. His translations of Dostoevsky, Balzac, and Hugo into Persian remain definitive editions read across Iran. He was also an influential literary critic and essayist.',
    views: 1200,
  },
  {
    firstName: 'Dariush',
    lastName: 'Ashuri',
    slug: 'dariush-ashuri',
    biography: 'Persian translator, essayist and thinker. Known for his translations of Austen and numerous European philosophical works, Ashuri is regarded as one of Iran\'s most important contemporary translators and intellectuals.',
    views: 900,
  },
  {
    firstName: 'Abolghasem',
    lastName: 'Ferdowsi',
    slug: 'abolghasem-ferdowsi',
    biography: 'Poet of the Shahnameh, the Persian Book of Kings. His epic poem of 50,000 couplets is a cornerstone of Persian literature and identity, preserving pre-Islamic Persian mythology and history. Often compared to Homer for his monumental contribution.',
    dateOfBirth: new Date('940-01-01'),
    dateOfDeath: new Date('1020-01-01'),
    views: 2900,
  },
  {
    firstName: 'Hafez',
    lastName: 'Shirazi',
    nickname: 'Hafez',
    slug: 'hafez-shirazi',
    biography: 'Beloved Persian lyric poet of the Divan. His ghazals explore themes of love, wine, mysticism, and divine beauty with unmatched musicality. His divan is consulted for fortune-telling (fal-e Hafez) in Iranian households to this day.',
    dateOfBirth: new Date('1315-01-01'),
    dateOfDeath: new Date('1390-01-01'),
    views: 2700,
  },
  {
    firstName: 'Joanne',
    lastName: 'Rowling',
    nickname: 'J.K. Rowling',
    slug: 'jk-rowling',
    biography: 'Creator of the Harry Potter series. From a struggling single mother to one of the world\'s most successful authors, Rowling\'s seven-book saga has sold over 500 million copies, been translated into 80 languages, and spawned a massive cultural phenomenon.',
    dateOfBirth: new Date('1965-07-31'),
    views: 6400,
  },
  {
    firstName: 'Francis Scott',
    lastName: 'Fitzgerald',
    nickname: 'F. Scott Fitzgerald',
    slug: 'f-scott-fitzgerald',
    biography: 'Chronicler of the Jazz Age; author of The Great Gatsby. His works capture the spirit, decadence, and disillusionment of the 1920s. He is widely regarded as one of the greatest American writers of the 20th century.',
    dateOfBirth: new Date('1896-09-24'),
    dateOfDeath: new Date('1940-12-21'),
    views: 4100,
  },
  {
    firstName: 'Nelle Harper',
    lastName: 'Lee',
    nickname: 'Harper Lee',
    slug: 'harper-lee',
    biography: 'Author of To Kill a Mockingbird. Her Pulitzer Prize-winning novel has become a classic of modern American literature, exploring racial injustice in the American South through the innocent eyes of a child. A masterpiece of moral courage.',
    dateOfBirth: new Date('1926-04-28'),
    dateOfDeath: new Date('2016-02-19'),
    views: 3800,
  },
  {
    firstName: 'Antoine',
    lastName: 'de Saint-Exupéry',
    slug: 'antoine-de-saint-exupery',
    biography: 'French aviator-author of The Little Prince. A pioneer of aviation who disappeared during a reconnaissance mission in World War II, his philosophical fable has become the most translated non-religious book in history.',
    dateOfBirth: new Date('1900-06-29'),
    dateOfDeath: new Date('1944-07-31'),
    views: 3600,
  },
  {
    firstName: 'Paulo',
    lastName: 'Coelho',
    slug: 'paulo-coelho',
    biography: 'Brazilian author of The Alchemist. His allegorical novel about following one\'s dreams has sold over 65 million copies worldwide, making it one of the best-selling books in history. He has won numerous international literary awards.',
    dateOfBirth: new Date('1947-08-24'),
    views: 3300,
  },
  {
    firstName: 'Albert',
    lastName: 'Camus',
    slug: 'albert-camus',
    biography: 'French-Algerian novelist, philosopher and Nobel laureate. His philosophy of the absurd, explored in The Stranger and The Myth of Sisyphus, made him one of the most influential thinkers of the 20th century. Nobel Prize in Literature 1957.',
    dateOfBirth: new Date('1913-11-07'),
    dateOfDeath: new Date('1960-01-04'),
    views: 4500,
  },
  {
    firstName: 'Gabriel',
    lastName: 'García Márquez',
    nickname: 'Gabo',
    slug: 'gabriel-garcia-marquez',
    biography: 'Colombian novelist and Nobel laureate; father of magical realism. His masterwork One Hundred Years of Solitude redefined Latin American literature. Nobel Prize in Literature 1982.',
    dateOfBirth: new Date('1927-03-06'),
    dateOfDeath: new Date('2014-04-17'),
    views: 4200,
  },
  {
    firstName: 'Franz',
    lastName: 'Kafka',
    slug: 'franz-kafka',
    biography: 'German-speaking Bohemian novelist and short-story writer. His works explore themes of alienation, guilt, anxiety, and absurdity. The term "Kafkaesque" has entered the lexicon to describe nightmarish, surreal situations.',
    dateOfBirth: new Date('1883-07-03'),
    dateOfDeath: new Date('1924-06-03'),
    views: 4000,
  },
  {
    firstName: 'Simone',
    lastName: 'de Beauvoir',
    slug: 'simone-de-beauvoir',
    biography: 'French existentialist philosopher and writer. Her groundbreaking work The Second Sex laid the foundation for modern feminism. She was a central figure in existentialist philosophy alongside Sartre.',
    dateOfBirth: new Date('1908-01-09'),
    dateOfDeath: new Date('1986-04-14'),
    views: 3200,
  },
  {
    firstName: 'Sadeq',
    lastName: 'Chubak',
    slug: 'sadeq-chubak',
    biography: 'Prominent Iranian fiction writer known for his uncompromising portrayal of society. Author of The Patient Stone and Tangna, he is considered one of the masters of modern Persian short story writing.',
    dateOfBirth: new Date('1916-08-25'),
    dateOfDeath: new Date('1998-07-15'),
    views: 1800,
  },
  {
    firstName: 'Simin',
    lastName: 'Daneshvar',
    slug: 'simin-daneshvar',
    biography: 'Iranian academic, novelist and translator. Her novel Savushun (1969) is considered the first modern Persian novel. She was also the first Iranian woman to publish a collection of short stories.',
    dateOfBirth: new Date('1921-06-14'),
    dateOfDeath: new Date('2012-03-08'),
    views: 2000,
  },
  {
    firstName: 'Milan',
    lastName: 'Kundera',
    slug: 'milan-kundera',
    biography: 'Czech-French writer known for The Unbearable Lightness of Being. His works explore themes of existentialism, politics, and the human condition with philosophical depth and irony.',
    dateOfBirth: new Date('1929-04-01'),
    dateOfDeath: new Date('2023-07-11'),
    views: 3400,
  },
  {
    firstName: 'Stieg',
    lastName: 'Larsson',
    slug: 'stieg-larsson',
    biography: 'Swedish journalist and author of the Millennium trilogy. His crime novels featuring Lisbeth Salander became international sensations and have sold over 80 million copies worldwide.',
    dateOfBirth: new Date('1954-08-15'),
    dateOfDeath: new Date('2004-11-09'),
    views: 3100,
  },
];

export async function seedAuthors(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting authors seeding...');
  const authorRepo = ds.getRepository(Author);
  let created = 0;
  let updated = 0;

  for (const author of authorsData) {
    const { created: isNew } = await upsert(authorRepo, { slug: author.slug }, author);
    if (isNew) {
      created++;
      console.log(`✅ Created author: ${author.firstName} ${author.lastName ?? ''}`);
    } else {
      updated++;
    }
  }

  logResult('Authors', created, updated);
  console.log('🎉 Authors seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('authors', seedAuthors).catch(() => process.exit(1));
}
