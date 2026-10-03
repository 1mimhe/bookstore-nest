import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Author } from '../../modules/authors/entities/author.entity';
import { Character } from '../../modules/books/entities/characters.entity';
import { Title } from '../../modules/books/entities/title.entity';
import { Tag } from '../../modules/tags/entities/tag.entity';
import { linkManyToMany, logResult, need, runStandalone, upsert } from './seed-utils';

interface TitleSpec {
  name: string;
  slug: string;
  summary: string;
  originallyPublishedAt: Date;
  features: string[];
  quotes: string[];
  views: number;
  authorSlugs: string[];
  tagSlugs: string[];
  characterSlugs: string[];
}

const titlesData: TitleSpec[] = [
  {
    name: 'Crime and Punishment',
    slug: 'crime-and-punishment',
    summary: 'Raskolnikov, a destitute ex-student in St. Petersburg, commits murder to prove a theory — then unravels under guilt. A profound exploration of morality, redemption, and the human psyche.',
    originallyPublishedAt: new Date('1866-01-01'),
    features: ['Psychological realism', 'Moral philosophy', 'Russian classic'],
    quotes: ['Pain and suffering are always inevitable for a large intelligence.', 'The soul is healed by being with children.'],
    views: 8400,
    authorSlugs: ['fyodor-dostoevsky'],
    tagSlugs: ['fiction-literature', 'philosophical', 'crime', 'russian-literature', '1001-novels', 'dark', '19th-century', 'thought-provoking', 'challenging'],
    characterSlugs: ['rodion-raskolnikov', 'sonya-marmeladova'],
  },
  {
    name: 'Pride and Prejudice',
    slug: 'pride-and-prejudice',
    summary: 'Elizabeth Bennet spars with the proud Mr. Darcy in Austen\'s sparkling comedy of manners. A witty exploration of love, reputation, and class in Regency England.',
    originallyPublishedAt: new Date('1813-01-28'),
    features: ['Regency romance', 'Social satire', 'Classic comedy of manners'],
    quotes: ['It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.', 'I am the happiest creature in the world.'],
    views: 7200,
    authorSlugs: ['jane-austen'],
    tagSlugs: ['romance', 'english-literature', '1001-novels', 'heartwarming', '19th-century', 'bestsellers'],
    characterSlugs: ['elizabeth-bennet'],
  },
  {
    name: '1984',
    slug: '1984',
    summary: 'Winston Smith rewrites history for the Party while Big Brother watches every move. Orwell\'s terrifying vision of a totalitarian future remains eerily relevant.',
    originallyPublishedAt: new Date('1949-06-08'),
    features: ['Dystopia', 'Totalitarianism warning', 'Political prophecy'],
    quotes: ['Big Brother is watching you.', 'Who controls the past controls the future.', 'War is peace. Freedom is slavery. Ignorance is strength.'],
    views: 9100,
    authorSlugs: ['george-orwell'],
    tagSlugs: ['dystopian', 'politics', 'science-fiction', 'english-literature', '1001-novels', 'thought-provoking', '20th-century', 'bestsellers'],
    characterSlugs: ['winston-smith'],
  },
  {
    name: 'Murder on the Orient Express',
    slug: 'murder-on-the-orient-express',
    summary: 'Poirot must find a murderer trapped aboard a snowbound luxury train. Christie\'s most ingenious plot features one of the most surprising endings in detective fiction.',
    originallyPublishedAt: new Date('1934-01-01'),
    features: ['Locked-room mystery', 'Poirot classic', 'Golden Age detective fiction'],
    quotes: ['The impossible could not have happened, therefore the impossible must be possible in spite of appearances.'],
    views: 5400,
    authorSlugs: ['agatha-christie'],
    tagSlugs: ['mystery', 'crime', '20th-century', 'quick-read', 'bestsellers'],
    characterSlugs: ['hercule-poirot'],
  },
  {
    name: 'Norwegian Wood',
    slug: 'norwegian-wood',
    summary: 'Toru Watanabe looks back on student days, loss and first love in 1960s Tokyo. Murakami\'s most realistic novel is a poignant meditation on grief, growing up, and the music that shapes us.',
    originallyPublishedAt: new Date('1987-09-04'),
    features: ['Coming of age', 'Melancholic romance', 'Japanese literary fiction'],
    quotes: ['If you only read the books that everyone else is reading, you can only think what everyone else is thinking.', 'Life is not the same thing as living.'],
    views: 4700,
    authorSlugs: ['haruki-murakami'],
    tagSlugs: ['romance', 'japanese-literature', 'contemporary', 'tragic-romance', 'thought-provoking'],
    characterSlugs: ['toru-watanabe'],
  },
  {
    name: 'The Blind Owl',
    slug: 'the-blind-owl',
    summary: 'بوف کور — a pen-case painter\'s fever dream of love, death and repetition. Hedayat\'s masterpiece is the most important work of 20th-century Persian fiction.',
    originallyPublishedAt: new Date('1937-01-01'),
    features: ['Surrealism', 'Persian modernism', 'Existential horror'],
    quotes: ['There are sores which slowly erode the mind in solitude like a kind of canker.', 'Writing is the pattern of a nightmare.'],
    views: 3900,
    authorSlugs: ['sadegh-hedayat'],
    tagSlugs: ['iranian-literature', 'philosophical', 'dark', 'thought-provoking', 'challenging'],
    characterSlugs: ['blind-owl-narrator'],
  },
  {
    name: 'Another Birth',
    slug: 'another-birth',
    summary: 'تولدی دیگر — Forough\'s luminous free-verse collection on rebirth, freedom, and the female body. A landmark in Persian poetry that shattered taboos.',
    originallyPublishedAt: new Date('1964-01-01'),
    features: ['Modern Persian poetry', 'Feminist voice', 'Free verse revolution'],
    quotes: ['I will greet the sun again.', 'I know no better safety than the warmth of a breast.'],
    views: 2600,
    authorSlugs: ['forough-farrokhzad'],
    tagSlugs: ['poetry', 'iranian-literature', 'contemporary'],
    characterSlugs: [],
  },
  {
    name: 'The Hobbit',
    slug: 'the-hobbit',
    summary: 'Bilbo Baggins leaves the Shire for dragon gold and returns with a ring. Tolkien\'s enchanting prelude to The Lord of the Rings is the foundation of modern fantasy.',
    originallyPublishedAt: new Date('1937-09-21'),
    features: ['Fantasy adventure', 'Middle-earth prelude', 'Children\'s classic'],
    quotes: ['In a hole in the ground there lived a hobbit.', 'It does not do to leave a live dragon out of your calculations.'],
    views: 6800,
    authorSlugs: ['jrr-tolkien'],
    tagSlugs: ['fantasy', 'adventure', 'english-literature', 'young-adults', 'bestsellers'],
    characterSlugs: ['bilbo-baggins'],
  },
  {
    name: 'Animal Farm',
    slug: 'animal-farm',
    summary: 'Revolution on Manor Farm curdles into tyranny in Orwell\'s devastating fable. "All animals are equal, but some animals are more equal than others."',
    originallyPublishedAt: new Date('1945-08-17'),
    features: ['Political fable', 'Allegory', 'Satire'],
    quotes: ['All animals are equal, but some animals are more equal than others.', 'The only good human being is a dead one.'],
    views: 5900,
    authorSlugs: ['george-orwell'],
    tagSlugs: ['social-satire', 'politics', 'english-literature', '20th-century', 'quick-read'],
    characterSlugs: ['napoleon-pig'],
  },
  {
    name: 'And Then There Were None',
    slug: 'and-then-there-were-none',
    summary: 'Ten strangers on an island are picked off one by one to a nursery rhyme. The best-selling mystery novel of all time with a solution that still stuns readers.',
    originallyPublishedAt: new Date('1939-11-06'),
    features: ['Closed-circle mystery', 'Best-selling mystery ever', 'Pure puzzle'],
    quotes: ['One of us... one of us is a murderer.', 'Ten little soldier boys went out to dine...'],
    views: 5100,
    authorSlugs: ['agatha-christie'],
    tagSlugs: ['mystery', 'suspenseful', 'bestsellers', '20th-century', 'quick-read'],
    characterSlugs: [],
  },
  {
    name: 'The Brothers Karamazov',
    slug: 'the-brothers-karamazov',
    summary: 'Three brothers, a murdered father, and the question of God in Dostoevsky\'s final and greatest novel. The Grand Inquisitor chapter alone is one of philosophy\'s supreme achievements.',
    originallyPublishedAt: new Date('1880-11-01'),
    features: ['Philosophical epic', 'The Grand Inquisitor', 'Dostoevsky\'s magnum opus'],
    quotes: ['The mystery of human existence lies not in just staying alive, but in finding something to live for.', 'The soul is healed by being with children.'],
    views: 6100,
    authorSlugs: ['fyodor-dostoevsky'],
    tagSlugs: ['fiction-literature', 'philosophical', 'russian-literature', '1001-novels', '19th-century', 'challenging', 'thought-provoking'],
    characterSlugs: [],
  },
  {
    name: 'The Great Gatsby',
    slug: 'the-great-gatsby',
    summary: 'Nick Carraway watches Jay Gatsby reach for Daisy across the green light. Fitzgerald\'s Jazz Age masterpiece is a meditation on the corruption of the American Dream.',
    originallyPublishedAt: new Date('1925-04-10'),
    features: ['Jazz Age classic', 'American Dream critique', 'Narrative perfection'],
    quotes: ['So we beat on, boats against the current, borne back ceaselessly into the past.', 'I hope she\'ll be a fool — that\'s the best thing a girl can be in this world.'],
    views: 5800,
    authorSlugs: ['f-scott-fitzgerald'],
    tagSlugs: ['fiction-literature', 'american-literature', '20th-century', '1001-novels', 'thought-provoking'],
    characterSlugs: ['jay-gatsby'],
  },
  {
    name: 'To Kill a Mockingbird',
    slug: 'to-kill-a-mockingbird',
    summary: 'Scout Finch comes of age while her father defends an innocent man in the American South. Lee\'s Pulitzer winner is a powerful exploration of racial injustice and moral courage.',
    originallyPublishedAt: new Date('1960-07-11'),
    features: ['Pulitzer winner', 'Moral courage', 'Coming of age'],
    quotes: ['You never really understand a person until you climb into his skin and walk around in it.', 'Mockingbirds don\'t do one thing but make music for us to enjoy.'],
    views: 5500,
    authorSlugs: ['harper-lee'],
    tagSlugs: ['american-literature', '20th-century', 'pulitzer-fiction', 'thought-provoking', 'challenging', 'bestsellers'],
    characterSlugs: ['atticus-finch'],
  },
  {
    name: 'The Little Prince',
    slug: 'the-little-prince',
    summary: 'شازده کوچولو — a pilot meets a small traveller asking big questions. Saint-Exupéry\'s fable is the most translated non-religious book in history.',
    originallyPublishedAt: new Date('1943-04-06'),
    features: ['Fable for all ages', 'Most translated French book', 'Philosophical allegory'],
    quotes: ['What is essential is invisible to the eye.', 'You become responsible, forever, for what you have tamed.'],
    views: 6300,
    authorSlugs: ['antoine-de-saint-exupery'],
    tagSlugs: ['french-literature', 'philosophical', 'children', 'inspirational', 'quick-read', 'bestsellers'],
    characterSlugs: ['the-little-prince'],
  },
  {
    name: 'The Alchemist',
    slug: 'the-alchemist',
    summary: 'Santiago the shepherd follows his Personal Legend to the pyramids. Coelho\'s allegorical fable about following your dreams has inspired millions worldwide.',
    originallyPublishedAt: new Date('1988-01-01'),
    features: ['Quest fable', 'Global bestseller', 'Inspirational'],
    quotes: ['When you want something, all the universe conspires in helping you to achieve it.', 'It\'s the possibility of having a dream come true that makes life interesting.'],
    views: 4900,
    authorSlugs: ['paulo-coelho'],
    tagSlugs: ['inspirational', 'philosophical', 'adventure', 'bestsellers', 'quick-read'],
    characterSlugs: ['santiago'],
  },
  {
    name: 'Shahnameh',
    slug: 'shahnameh',
    summary: 'شاهنامه — Ferdowsi\'s epic of Persian kings, heroes and myths. At 50,000 couplets, it is one of the longest poems ever written and the cornerstone of Iranian identity.',
    originallyPublishedAt: new Date('1010-03-08'),
    features: ['Persian national epic', '50,000 couplets', 'Pre-Islamic mythology'],
    quotes: ['I have revived the Ajam with Persian letters.', 'A hundred years of grief may be cured by a moment of happiness.'],
    views: 4500,
    authorSlugs: ['abolghasem-ferdowsi'],
    tagSlugs: ['poetry', 'iranian-literature', 'challenging', 'ancient-times'],
    characterSlugs: ['scheherazade'],
  },
  {
    name: 'Divan-e Hafez',
    slug: 'divan-e-hafez',
    summary: 'دیوان حافظ — ghazals of love, wine and mysticism. Hafez\'s poetry is consulted for fortune-telling (fal) in Iranian households and remains the most beloved body of Persian verse.',
    originallyPublishedAt: new Date('1390-01-01'),
    features: ['Persian lyric poetry', 'Fal-e Hafez tradition', 'Mystical love'],
    quotes: ['I have learned so much from God that I can no longer call myself a Christian, Hindu, Muslim, Buddhist, or Jew.', 'Stay close to anything that makes you glad you are alive.'],
    views: 4200,
    authorSlugs: ['hafez-shirazi'],
    tagSlugs: ['poetry', 'iranian-literature', 'inspirational', 'ancient-times'],
    characterSlugs: [],
  },
  {
    name: "Harry Potter and the Philosopher's Stone",
    slug: 'harry-potter-1',
    summary: 'Harry discovers he is a wizard and enters Hogwarts for the first time. Rowling\'s magical world-building launched a cultural phenomenon spanning seven books and a generation.',
    originallyPublishedAt: new Date('1997-06-26'),
    features: ['Series opener', 'Modern classic', 'Cultural phenomenon'],
    quotes: ['It does not do to dwell on dreams and forget to live.', 'The ones that love us never really leave us.', 'Fear of a name increases fear of the thing itself.'],
    views: 7000,
    authorSlugs: ['jk-rowling'],
    tagSlugs: ['fantasy', 'adventure', 'young-adults', 'harry-potter', 'bestsellers', 'english-literature'],
    characterSlugs: ['harry-potter'],
  },
  {
    name: 'The Lord of the Rings',
    slug: 'the-lord-of-the-rings',
    summary: 'Frodo carries the One Ring to Mordor in Tolkien\'s epic quest. The defining work of modern fantasy, a masterwork of world-building that created an entire mythology.',
    originallyPublishedAt: new Date('1954-07-29'),
    features: ['Epic fantasy', 'Three volumes, one journey', 'Myth-making'],
    quotes: ['Not all those who wander are lost.', 'I wish the Ring had never come to me.', 'Even the smallest person can change the course of the future.'],
    views: 6700,
    authorSlugs: ['jrr-tolkien'],
    tagSlugs: ['fantasy', 'adventure', 'english-literature', '1001-novels', '20th-century', 'lord-of-the-rings', 'bestsellers'],
    characterSlugs: ['frodo-baggins'],
  },
  {
    name: 'The Stranger',
    slug: 'the-stranger',
    summary: 'Meursault\'s emotional detachment leads to murder and execution in Camus\'s masterpiece of existential fiction. A short, devastating exploration of absurdism and the human condition.',
    originallyPublishedAt: new Date('1942-01-01'),
    features: ['Absurdist fiction', 'Nobel Prize author', 'Existentialism'],
    quotes: ['I opened myself to the gentle indifference of the world.', 'Mother died today. Or maybe yesterday; I can\'t be sure.'],
    views: 4800,
    authorSlugs: ['albert-camus'],
    tagSlugs: ['fiction-literature', 'philosophical', 'french-literature', '20th-century', 'thought-provoking', 'quick-read', 'nobel-literature'],
    characterSlugs: ['meursault'],
  },
  {
    name: 'One Hundred Years of Solitude',
    slug: 'one-hundred-years-of-solitude',
    summary: 'The rise and fall of the Buendía family in the mythical town of Macondo. García Márquez\'s magical realism masterpiece is a landmark of Latin American literature.',
    originallyPublishedAt: new Date('1967-06-05'),
    features: ['Magical realism', 'Nobel Prize author', 'Multi-generational saga'],
    quotes: ['It\'s enough for me to be sure that you and I exist at this moment.', 'Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice.'],
    views: 5200,
    authorSlugs: ['gabriel-garcia-marquez'],
    tagSlugs: ['fiction-literature', 'latin-american-literature', '20th-century', '1001-novels', 'thought-provoking', 'nobel-literature', 'bestsellers'],
    characterSlugs: [],
  },
  {
    name: 'The Metamorphosis',
    slug: 'the-metamorphosis',
    summary: 'Gregor Samsa wakes up as a giant insect. Kafka\'s most famous story is a terrifying, darkly funny exploration of alienation, family duty, and dehumanization.',
    originallyPublishedAt: new Date('1915-01-01'),
    features: ['Absurdist fiction', 'Existential dread', 'Short masterpiece'],
    quotes: ['As Gregor Samsa awoke one morning from uneasy dreams he found himself transformed in his bed into a gigantic insect.', 'I cannot make anyone understand what is happening inside me.'],
    views: 4300,
    authorSlugs: ['franz-kafka'],
    tagSlugs: ['fiction-literature', 'philosophical', 'dark', '20th-century', 'thought-provoking', 'quick-read', 'challenging'],
    characterSlugs: ['gregor-samsa'],
  },
  {
    name: 'The Unbearable Lightness of Being',
    slug: 'the-unbearable-lightness-of-being',
    summary: 'Two couples navigate love, politics, and philosophy during the Prague Spring. Kundera\'s philosophical novel explores the tension between lightness and weight in human existence.',
    originallyPublishedAt: new Date('1984-01-01'),
    features: ['Philosophical fiction', 'Prague Spring', 'Love and politics'],
    quotes: ['The heavier the burden, the closer our lives come to the earth, the more real and truthful they become.', 'In the sunset of life, God will judge us by our pleasures.'],
    views: 3800,
    authorSlugs: ['milan-kundera'],
    tagSlugs: ['fiction-literature', 'philosophical', 'romance', '20th-century', 'thought-provoking'],
    characterSlugs: [],
  },
  {
    name: 'The Second Sex',
    slug: 'the-second-sex',
    summary: 'One is not born, but rather becomes, a woman. De Beauvoir\'s groundbreaking philosophical treatise laid the foundation for modern feminist theory.',
    originallyPublishedAt: new Date('1949-01-01'),
    features: ['Feminist philosophy', 'Existentialist ethics', 'Gender studies foundation'],
    quotes: ['One is not born, but rather becomes, a woman.', 'Representation of the world, like the world itself, is the work of men.'],
    views: 3500,
    authorSlugs: ['simone-de-beauvoir'],
    tagSlugs: ['philosophy', 'french-literature', '20th-century', 'thought-provoking', 'academic', 'challenging'],
    characterSlugs: [],
  },
  {
    name: 'The Grasshopper',
    slug: 'the-grasshopper',
    summary: 'سه قصه (The Grasshopper) — Chubak\'s masterful collection of three stories about the underbelly of Iranian society. Unflinching, compassionate, and beautifully crafted.',
    originallyPublishedAt: new Date('1956-01-01'),
    features: ['Persian short stories', 'Social realism', 'Literary modernism'],
    quotes: ['Life is a game, but not a fair one.'],
    views: 1600,
    authorSlugs: ['sadeq-chubak'],
    tagSlugs: ['iranian-literature', 'dystopian', 'contemporary'],
    characterSlugs: [],
  },
  {
    name: 'Daneshjou',
    slug: 'daneshjou',
    summary: 'دانشجو (The Student) — Daneshvar\'s poignant novel following a young woman navigating love, politics, and identity in pre-revolutionary Iran. A rare female perspective in Persian fiction.',
    originallyPublishedAt: new Date('1980-01-01'),
    features: ['Persian women\'s fiction', 'Political drama', 'Campus life'],
    quotes: ['She had the feeling she was being swallowed by the city.'],
    views: 1400,
    authorSlugs: ['simin-daneshvar'],
    tagSlugs: ['iranian-literature', 'romance', 'contemporary'],
    characterSlugs: [],
  },
  {
    name: 'The Girl with the Dragon Tattoo',
    slug: 'the-girl-with-the-dragon-tattoo',
    summary: 'Journalist Mikael Blomkvist and hacker Lisbeth Salander investigate a wealthy family\'s dark secrets. Larsson\'s thriller is a gripping blend of mystery, social commentary, and Nordic noir.',
    originallyPublishedAt: new Date('2005-01-01'),
    features: ['Nordic noir', 'Crime thriller', 'Social commentary'],
    quotes: ['Vengeance is a dish best served cold.', 'She had no view of the world that did not include herself.'],
    views: 4100,
    authorSlugs: ['stieg-larsson'],
    tagSlugs: ['mystery', 'crime', '20th-century', 'bestsellers', 'suspenseful', 'violence'],
    characterSlugs: [],
  },
];

export async function seedTitles(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting titles seeding...');
  const titleRepo = ds.getRepository(Title);
  const authorRepo = ds.getRepository(Author);
  const tagRepo = ds.getRepository(Tag);
  const characterRepo = ds.getRepository(Character);
  let created = 0;
  let updated = 0;

  for (const spec of titlesData) {
    const { entity: title, created: isNew } = await upsert(
      titleRepo,
      { slug: spec.slug },
      {
        name: spec.name,
        slug: spec.slug,
        summary: spec.summary,
        originallyPublishedAt: spec.originallyPublishedAt,
        features: spec.features,
        quotes: spec.quotes,
        views: spec.views,
      },
    );
    if (isNew) {
      created++;
      console.log(`✅ Created title: ${spec.name}`);
    } else {
      updated++;
    }

    const authorIds: string[] = [];
    for (const slug of spec.authorSlugs) {
      authorIds.push((await need(authorRepo, { slug }, `author:${slug}`)).id);
    }
    for (const authorId of authorIds) {
      await linkManyToMany(ds, Author, 'titles', authorId, [title.id]);
    }

    const tagIds: string[] = [];
    for (const slug of spec.tagSlugs) {
      const tag = await tagRepo.findOne({ where: { slug } });
      if (!tag) {
        console.log(`⚠️  Tag "${slug}" not found — skipping link for "${spec.slug}"`);
        continue;
      }
      tagIds.push(tag.id);
    }
    for (const tagId of tagIds) {
      await linkManyToMany(ds, Tag, 'titles', tagId, [title.id]);
    }

    for (const slug of spec.characterSlugs) {
      const character = await need(characterRepo, { slug }, `character:${slug}`);
      await linkManyToMany(ds, Character, 'titles', character.id, [title.id]);
    }
  }

  logResult('Titles', created, updated);
  console.log('🎉 Titles seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('titles', seedTitles).catch(() => process.exit(1));
}
