import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Author } from '../../modules/authors/entities/author.entity';
import { Blog } from '../../modules/blogs/entities/blog.entity';
import { Title } from '../../modules/books/entities/title.entity';
import { Publisher } from '../../modules/publishers/entities/publisher.entity';
import { Tag } from '../../modules/tags/entities/tag.entity';
import { linkManyToMany, logResult, need, runStandalone, upsert } from './seed-utils';

interface BlogSpec {
  subject: string;
  slug: string;
  summary: string;
  content: string;
  titleSlug?: string;
  authorSlug?: string;
  publisherSlug?: string;
  tagSlugs: string[];
  views: number;
}

const blogsData: BlogSpec[] = [
  {
    subject: 'Why Crime and Punishment still hurts',
    slug: 'why-crime-and-punishment-still-hurts',
    summary: 'On guilt, poverty and the psychology Dostoevsky mapped 150 years ago.',
    content: 'Raskolnikov\'s theory collapses the moment the axe falls. What follows is not a detective story but an autopsy of conscience.\n\nDostoevsky wrote this novel in two months, racing a publisher deadline, yet the result reads like a century of thought compressed into 600 pages. The Behazin translation captures the feverish energy of the original.\n\nIf you read one Russian novel this year, make it this one — preferably the Behazin translation. The psychological acuity is terrifying: Raskolnikov\'s rationalizations feel modern, as if Dostoevsky were writing about social media morality rather than 19th-century St. Petersburg.\n\nThe novel\'s genius lies in its structure: the murder happens in the first act, and everything after is the real crime — the murder of one\'s own soul.',
    titleSlug: 'crime-and-punishment',
    authorSlug: 'fyodor-dostoevsky',
    tagSlugs: ['fiction-literature', 'philosophical', 'russian-literature'],
    views: 1800,
  },
  {
    subject: 'A starter guide to mystery novels',
    slug: 'starter-guide-to-mystery-novels',
    summary: 'From Christie to locked rooms: five doors into the genre.',
    content: 'Start with Poirot on the Orient Express, then try And Then There Were None with the lights on.\n\nMystery is one of the most rewarding genres for careful readers. The best mystery novels don\'t just hide the answer — they hide it in plain sight.\n\nHere are five entry points:\n\n1. **Christie\'s Poirot novels** — The golden standard. Murder on the Orient Express is the perfect starting point.\n\n2. **The locked-room mystery** — John Dickson Carr perfected this subgenre. Try The Hollow Man.\n\n3. **Nordic noir** — Start with Stieg Larsson\'s Millennium trilogy for a darker, grittier experience.\n\n4. **Cozy mysteries** — Lighter, often set in small towns. Agatha Christie\'s Miss Marple series is ideal.\n\n5. **The procedural** — Michael Connelly\'s Harry Bosch series for those who love police work.\n\nMystery rewards careful readers — the clues were always on the page.',
    authorSlug: 'agatha-christie',
    tagSlugs: ['mystery', 'crime', 'quick-read'],
    views: 1500,
  },
  {
    subject: 'Murakami for beginners',
    slug: 'murakami-for-beginners',
    summary: 'Where to start with Haruki Murakami — and why Norwegian Wood first.',
    content: 'Norwegian Wood is Murakami at his most human: no talking cats, just grief, youth and The Beatles.\n\nMurakami can be intimidating. His novels range from realistic love stories to surreal dreamscapes where cats talk and fish rain from the sky. Where do you start?\n\n**For realism:** Norwegian Wood. Set in 1960s Tokyo, it\'s a straightforward (by Murakami standards) novel about a young man navigating loss and love. It\'s his best-selling book in Japan and the most accessible entry point.\n\n**For surrealism:** Kafka on the Shore. A 15-year-old runaway and an old man who talks to cats — it shouldn\'t work, but it does magnificently.\n\n**For ambition:** The Wind-Up Bird Chronicle. His masterpiece. Part war epic, part domestic drama, part metaphysical puzzle.\n\n**For short fiction:** After the Quake. Six interconnected stories set in the aftermath of the Kobe earthquake.\n\nRead it in autumn. Trust us.',
    titleSlug: 'norwegian-wood',
    authorSlug: 'haruki-murakami',
    tagSlugs: ['japanese-literature', 'romance', 'contemporary'],
    views: 1300,
  },
  {
    subject: 'Forough, fifty years later',
    slug: 'forough-fifty-years-later',
    summary: 'Another Birth and the voice that remade Persian poetry.',
    content: 'تولدی دیگر remains startlingly alive: a woman writing freedom into a language that had little room for it.\n\nForough Farrokhzad died at 32, but her impact on Persian literature is immeasurable. Another Birth, published in 1964, shattered every taboo in Iranian poetry.\n\nBefore Forough, Persian poetry was largely a male domain of formal verse. She wrote in free verse about the female body, desire, loneliness, and the yearning for freedom — subjects that were simply not discussed in public, let alone in poetry.\n\n"I will greet the sun again" — the opening line of her most famous poem — has become a symbol of resilience for Iranian women. Her collection is not just poetry; it is a declaration of independence.\n\nThis week\'s staff pick from the poetry shelf.',
    titleSlug: 'another-birth',
    authorSlug: 'forough-farrokhzad',
    tagSlugs: ['poetry', 'iranian-literature'],
    views: 900,
  },
  {
    subject: 'Notes from our publisher: Cheshmeh on classics',
    slug: 'cheshmeh-on-classics',
    summary: 'Why new translations of old books matter.',
    content: 'Every generation deserves its own Dostoevsky. Our editors explain how a translation is rebuilt from scratch.\n\nTranslation is not a mechanical act — it is an interpretation. When Cheshmeh publishes a new translation of 1984 or Crime and Punishment, we\'re not just reprinting a book. We\'re reimagining it for contemporary Iranian readers.\n\nOur editors start by reading the original alongside three or four existing Persian translations. They identify what works and what doesn\'t — passages that feel dated, cultural references that need context, sentence structures that don\'t flow in modern Persian.\n\nThe goal is not just accuracy but readability. A translation that technically follows every word but reads like a textbook has failed.\n\nFeaturing the new Cheshmeh editions of 1984 and Animal Farm.',
    publisherSlug: 'cheshmeh',
    tagSlugs: ['fiction-literature', 'new-releases'],
    views: 700,
  },
  {
    subject: 'The art of the Persian book cover',
    slug: 'art-of-persian-book-cover',
    summary: 'How Iranian publishers use design to reimagine world classics.',
    content: 'A great book cover doesn\'t just sell — it interprets. Iranian publishers have developed a distinctive visual language for world literature.\n\nWalk into any Iranian bookstore and you\'ll notice something: the same novel can look completely different depending on the publisher. Cheshmeh\'s covers tend toward minimalist typography and muted colours. Nashr-e Nay favours bold, graphic imagery. Amir Kabir goes for classical elegance.\n\nThis isn\'t accidental. Each publisher\'s design choices reflect their editorial philosophy. Cheshmeh\'s clean designs say: this book speaks for itself. Nashr-e Nay\'s bold graphics say: this is a cultural event.\n\nThe best Persian book covers achieve what all great design does: they make you want to pick up the book, open it, and discover what\'s inside.',
    publisherSlug: 'cheshmeh',
    tagSlugs: ['fiction-literature', 'iranian-literature', 'art'],
    views: 550,
  },
  {
    subject: 'Orwell\'s enduring relevance',
    slug: 'orwells-enduring-relevance',
    summary: 'Why 1984 and Animal Farm speak louder than ever.',
    content: 'Every decade finds new reasons to read Orwell. His warnings about power, language, and truth feel dangerously current.\n\nGeorge Orwell wrote 1984 in 1948, on the Scottish island of Jura, while dying of tuberculosis. He had maybe two years to live. He used them to write the most important political novel of the 20th century.\n\nWhat makes 1984 timeless is not its specific predictions — telescreens and Thought Police — but its analysis of how power operates. The Party\'s three slogans — War is Peace, Freedom is Slavery, Ignorance is Strength — are not just fictional slogans. They describe real techniques of political control.\n\nAnimal Farm is even more relevant: "All animals are equal, but some animals are more equal than others" perfectly captures the hypocrisy of every revolution that betrays its ideals.\n\nThese aren\'t just novels. They\'re survival guides.',
    titleSlug: '1984',
    authorSlug: 'george-orwell',
    tagSlugs: ['politics', 'english-literature', '20th-century'],
    views: 1100,
  },
  {
    subject: 'Why The Little Prince matters more than you think',
    slug: 'why-the-little-prince-matters',
    summary: 'A children\'s book that explains being human better than most philosophy.',
    content: 'What is essential is invisible to the eye — and what makes The Little Prince essential is invisible to adults.\n\nAntoine de Saint-Exupéry wrote The Little Prince in 1943, while in exile in New York during World War II. He was a pilot, not a professional writer. He disappeared on a reconnaissance mission the following year.\n\nThe book is 96 pages long. In those pages, Saint-Exupéry captures truths about love, loss, responsibility, and the meaning of life that most philosophers spend entire careers failing to articulate.\n\n"It is only with the heart that one can see rightly; what is essential is invisible to the eye." This single line contains more wisdom than most self-help books.\n\nThe Little Prince is the most translated non-religious book in history, and it deserves every translation.',
    titleSlug: 'the-little-prince',
    authorSlug: 'antoine-de-saint-exupery',
    tagSlugs: ['french-literature', 'philosophical', 'children', 'inspirational'],
    views: 850,
  },
  {
    subject: 'A reading list for dark winter evenings',
    slug: 'reading-list-dark-winter-evenings',
    summary: 'Books that are best read by firelight.',
    content: 'When the nights are long and cold, these books will keep you company — and slightly terrified.\n\n**The Blind Owl** by Sadegh Hedayat — Read this at midnight. It\'s meant for midnight. The feverish, repetitive prose will seep into your dreams.\n\n**The Stranger** by Albert Camus — Short enough to read in one sitting, disturbing enough to keep you awake all night.\n\n**And Then There Were None** by Agatha Christie — The perfect snowstorm book. Ten strangers, an island, and no escape.\n\n**The Metamorphosis** by Franz Kafka — Eighty pages that will make you question everything about your own existence.\n\n**Norwegian Wood** by Haruki Murakami — Melancholic, beautiful, and best read with jazz playing softly in the background.\n\nPour yourself something warm, dim the lights, and begin.',
    tagSlugs: ['fiction-literature', 'dark', 'thought-provoking'],
    views: 680,
  },
  {
    subject: 'How Tolkien built Middle-earth',
    slug: 'how-tolkien-built-middle-earth',
    summary: 'The philologist who created modern fantasy.',
    content: 'Tolkien didn\'t just write a story — he built a world with its own languages, history, and mythology.\n\nBefore The Hobbit was published in 1937, Tolkien had been working on his invented languages for over 20 years. Middle-earth wasn\'t a setting he created for a novel — it was a world he created for his languages, and the novels grew from it.\n\nThe Elvish languages Quenya and Sindarin are fully developed conlangs with grammar, syntax, and etymologies. Tolkien was a professor of Anglo-Saxon at Oxford, and he brought that philological rigour to his fictional world.\n\nThe result is the most convincing secondary world in all of literature. When you read The Lord of the Rings, you feel the weight of thousands of years of history behind every name and place.\n\nThis is what separates Tolkien from imitators: he didn\'t just create a fantasy — he created a reality.',
    titleSlug: 'the-hobbit',
    authorSlug: 'jrr-tolkien',
    tagSlugs: ['fantasy', 'adventure', 'english-literature'],
    views: 950,
  },
  {
    subject: 'Camus and the absurd hero',
    slug: 'camus-and-the-absurd-hero',
    summary: 'What Meursault teaches us about living without meaning.',
    content: 'In The Stranger, Meursault doesn\'t care. And that\'s the most radical thing in 20th-century fiction.\n\nAlbert Camus won the Nobel Prize at 44. He was a football goalkeeper, a resistance fighter, and arguably the most handsome philosopher of the 20th century. His concept of the absurd — that life has no inherent meaning, and we must imagine Sisyphus happy — changed how we think about existence.\n\nThe Stranger is the perfect expression of this philosophy. Meursault refuses to pretend he\'s sad at his mother\'s funeral. He shoots an Arab on the beach because the sun is in his eyes. He doesn\'t cry at his trial.\n\nBut here\'s the thing: Meursault isn\'t a monster. He\'s the only honest person in the novel. Everyone else is performing emotions they don\'t feel.\n\n"I opened myself to the gentle indifference of the world." That\'s not nihilism. That\'s freedom.',
    titleSlug: 'the-stranger',
    authorSlug: 'albert-camus',
    tagSlugs: ['philosophical', 'french-literature', 'thought-provoking'],
    views: 720,
  },
  {
    subject: 'The enduring power of Shahnameh',
    slug: 'enduring-power-of-shahnameh',
    summary: 'Ferdowsi\'s epic and why it still defines Iranian identity.',
    content: '940 years after it was written, Shahnameh remains the beating heart of Iranian culture.\n\nAbolghasem Ferdowsi spent 30 years writing 50,000 couplets of Persian epic poetry. When he finished in 1010 CE, Iran was under Arab-Muslim rule and the Persian language was in danger of extinction.\n\nShahnameh saved it. By writing in pure Persian (without Arabic loanwords), Ferdowsi preserved the language and the pre-Islamic mythology of Iran. The stories of Rostam and Sohrab, Siavash, and Jamshid are still told in every Iranian household.\n\nThe poem\'s opening lines — "I have revived the Ajam with Persian letters" — are Ferdowsi\'s mission statement. He wasn\'t just writing poetry. He was saving a civilization.\n\nToday, Shahnameh is taught in every Iranian school, quoted in daily conversation, and adapted into films, graphic novels, and video games. Its influence is immeasurable.',
    titleSlug: 'shahnameh',
    authorSlug: 'abolghasem-ferdowsi',
    tagSlugs: ['poetry', 'iranian-literature', 'ancient-times'],
    views: 600,
  },
  {
    subject: 'Why we still need Kafka',
    slug: 'why-we-still-need-kafka',
    summary: 'In a world of algorithms and bureaucracy, Kafka is more relevant than ever.',
    content: 'The word "Kafkaesque" exists because no other word captures what Kafka described.\n\nFranz Kafka died in 1924, at 40, from tuberculosis. He published almost nothing during his lifetime and asked for his manuscripts to be burned. Thank God his friend Max Brod refused.\n\nKafka\'s genius was in describing the absurdity of modern life before it fully existed. The Trial, written in 1914, depicts a man arrested for an unnamed crime by an inaccessible authority — try reading that in the age of algorithmic moderation.\n\nThe Metamorphosis, written in a single night, imagines a man who wakes up as an insect and is primarily worried about being late for work. If that\'s not a commentary on capitalism, nothing is.\n\nKafka didn\'t predict the future. He described the present with such precision that the present caught up with him.',
    authorSlug: 'franz-kafka',
    tagSlugs: ['philosophical', 'dark', 'thought-provoking', 'challenging'],
    views: 800,
  },
];

export async function seedBlogs(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting blogs seeding...');
  const blogRepo = ds.getRepository(Blog);
  const titleRepo = ds.getRepository(Title);
  const authorRepo = ds.getRepository(Author);
  const publisherRepo = ds.getRepository(Publisher);
  const tagRepo = ds.getRepository(Tag);
  let created = 0;
  let updated = 0;

  for (const spec of blogsData) {
    const title = spec.titleSlug
      ? await need(titleRepo, { slug: spec.titleSlug }, `title:${spec.titleSlug}`)
      : undefined;
    const author = spec.authorSlug
      ? await need(authorRepo, { slug: spec.authorSlug }, `author:${spec.authorSlug}`)
      : undefined;
    const publisher = spec.publisherSlug
      ? await need(publisherRepo, { slug: spec.publisherSlug }, `publisher:${spec.publisherSlug}`)
      : undefined;

    const { entity: blog, created: isNew } = await upsert(
      blogRepo,
      { slug: spec.slug },
      {
        subject: spec.subject,
        slug: spec.slug,
        summary: spec.summary,
        content: spec.content,
        isPublic: true,
        titleId: title?.id,
        authorId: author?.id,
        publisherId: publisher?.id,
        views: spec.views,
      },
    );
    if (isNew) {
      created++;
      console.log(`✅ Created blog: ${spec.subject}`);
    } else {
      updated++;
    }

    for (const slug of spec.tagSlugs) {
      const tag = await tagRepo.findOne({ where: { slug } });
      if (!tag) {
        console.log(`⚠️  Tag "${slug}" not found — skipping link for "${spec.slug}"`);
        continue;
      }
      await linkManyToMany(ds, Tag, 'blogs', tag.id, [blog.id]);
    }
  }

  logResult('Blogs', created, updated);
  console.log('🎉 Blogs seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('blogs', seedBlogs).catch(() => process.exit(1));
}
