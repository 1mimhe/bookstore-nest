import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Character } from '../../modules/books/entities/characters.entity';
import { logResult, runStandalone, upsert } from './seed-utils';

const charactersData = [
  {
    fullName: 'Rodion Raskolnikov',
    nickName: 'Rodya',
    slug: 'rodion-raskolnikov',
    biography: 'Impoverished ex-student in St. Petersburg whose theory of extraordinary men leads him to murder a pawnbroker. His psychological torment and eventual redemption form the core of Crime and Punishment.',
  },
  {
    fullName: 'Elizabeth Bennet',
    nickName: 'Lizzy',
    slug: 'elizabeth-bennet',
    biography: 'Witty second Bennet daughter; prejudiced against Mr. Darcy at first, but her intelligence, honesty, and moral courage make her one of literature\'s most beloved heroines.',
  },
  {
    fullName: 'Winston Smith',
    slug: 'winston-smith',
    biography: 'Ministry of Truth clerk who dares to remember and to love in a world where both are crimes. His quiet rebellion against Big Brother makes him a symbol of human resistance.',
  },
  {
    fullName: 'Hercule Poirot',
    slug: 'hercule-poirot',
    biography: 'Belgian detective who solves crimes with his "little grey cells." Fastidious, egotistical, and brilliant, Poirot is one of the most famous fictional detectives ever created.',
  },
  {
    fullName: 'Toru Watanabe',
    slug: 'toru-watanabe',
    biography: 'Quiet Tokyo student torn between the beautiful, troubled Naoko and the spirited Midori. His journey through grief and love in 1960s Tokyo forms the emotional heart of Norwegian Wood.',
  },
  {
    fullName: 'The Narrator of Blind Owl',
    slug: 'blind-owl-narrator',
    biography: 'Opium-dreaming pen-case painter haunted by an ethereal woman. His repetitive, nightmarish existence blurs the line between reality and hallucination in Hedayat\'s masterpiece.',
  },
  {
    fullName: 'Bilbo Baggins',
    slug: 'bilbo-baggins',
    biography: 'A respectable hobbit dragged out of his comfort hole by dwarves and a wizard. His unexpected journey to the Lonely Mountain reveals a courage he never knew he possessed.',
  },
  {
    fullName: 'Napoleon the Pig',
    slug: 'napoleon-pig',
    biography: 'The Berkshire boar who becomes Manor Farm\'s tyrant. Orwell\'s allegorical creation represents the corruption of revolutionary ideals into authoritarianism.',
  },
  {
    fullName: 'Harry Potter',
    slug: 'harry-potter',
    biography: 'The boy who lived; Hogwarts student and seeker. Orphaned and raised by cruel relatives, Harry discovers he is a wizard and must confront the dark wizard who killed his parents.',
  },
  {
    fullName: 'Jay Gatsby',
    nickName: 'Gatsby',
    slug: 'jay-gatsby',
    biography: 'Mysterious millionaire chasing a green light across the bay. Born James Gatz, he reinvents himself to win back the love of Daisy Buchanan, embodying the tragic promise of the American Dream.',
  },
  {
    fullName: 'Atticus Finch',
    slug: 'atticus-finch',
    biography: 'Maycomb lawyer defending Tom Robinson with quiet courage. As a single father raising Scout and Jem, he teaches moral integrity in the face of deep-seated racial prejudice.',
  },
  {
    fullName: 'The Little Prince',
    slug: 'the-little-prince',
    biography: 'A traveller from asteroid B-612 asking essential questions about life, love, and what truly matters. His encounters with adults on various planets reveal the absurdity of grown-up priorities.',
  },
  {
    fullName: 'Jean-Baptiste Grenouille',
    slug: 'jean-baptiste-grenouille',
    biography: 'The scentless perfumer of Patrick Süskind\'s novel, born with an extraordinary sense of smell. His obsessive quest to create the perfect fragrance leads to a trail of murder.',
  },
  {
    fullName: 'Amy Dunne',
    slug: 'amy-dunne',
    biography: 'The cunning, sociopathic wife in Gone Girl. Her elaborate scheme to frame her husband for murder explores themes of gender roles, media manipulation, and the performative nature of identity.',
  },
  {
    fullName: 'Offred',
    slug: 'offred',
    biography: 'The narrator of The Handmaid\'s Tale, a woman stripped of her name and rights in the theocratic Republic of Gilead. Her memories of freedom and her struggle to survive make her an icon of resistance.',
  },
  {
    fullName: 'Santiago',
    slug: 'santiago',
    biography: 'The shepherd boy protagonist of The Alchemist, who follows his Personal Legend from Spain to the Egyptian pyramids. His journey is an allegory for the pursuit of one\'s dreams.',
  },
  {
    fullName: 'Stevens',
    slug: 'stevens',
    biography: 'The loyal butler of Darlington Hall in Kazuo Ishiguro\'s The Remains of the Day. His dignified reflections on service, loyalty, and missed opportunities create a profoundly moving portrait.',
  },
  {
    fullName: 'Meursault',
    slug: 'meursault',
    biography: 'The detached narrator of Camus\'s The Stranger, who commits a senseless murder and faces execution. His emotional indifference challenges conventional morality and social expectations.',
  },
  {
    fullName: 'Sherlock Holmes',
    slug: 'sherlock-holmes',
    biography: 'The world\'s first consulting detective, living at 221B Baker Street with Dr. Watson. His mastery of deduction, violin playing, and cocaine habit make him literature\'s most famous investigator.',
  },
  {
    fullName: 'Jane Eyre',
    slug: 'jane-eyre',
    biography: 'Orphaned governess who falls in love with the brooding Mr. Rochester at Thornfield Hall. Her fierce independence, moral integrity, and demand for equality make her a feminist icon.',
  },
  {
    fullName: 'Sethe',
    slug: 'sethe',
    biography: 'The protagonist of Toni Morrison\'s Beloved, a former slave haunted by the ghost of her daughter. Her story explores the devastating legacy of slavery and the desperate acts of a mother\'s love.',
  },
  {
    fullName: 'Anna Karenina',
    slug: 'anna-karenina',
    biography: 'Tolstoy\'s tragic heroine who abandons her husband and son for a passionate affair with Count Vronsky. Her story explores the conflict between personal desire and social convention.',
  },
  {
    fullName: 'Gregor Samsa',
    slug: 'gregor-samsa',
    biography: 'The traveling salesman who wakes up as a giant insect in Kafka\'s Metamorphosis. His transformation explores alienation, family duty, and the dehumanizing effects of capitalism.',
  },
  {
    fullName: 'Scheherazade',
    slug: 'scheherazade',
    biography: 'The legendary narrator of One Thousand and One Nights. To delay her execution, she tells the king captivating stories, each ending on a cliffhanger, ultimately saving her life through the power of narrative.',
  },
  {
    fullName: 'Raskolnikov\'s Sonya',
    slug: 'sonya-marmeladova',
    biography: 'Sonya Marmeladova, the prostitute with a heart of gold in Crime and Punishment. She reads Raskolnikov the story of Lazarus and becomes his moral compass toward redemption.',
  },
  {
    fullName: 'Frodo Baggins',
    slug: 'frodo-baggins',
    biography: 'Hobbit of the Shire who inherits the One Ring from Bilbo and undertakes the perilous journey to Mount Doom to destroy it. His courage and resilience in the face of overwhelming evil form the heart of The Lord of the Rings.',
  },
  {
    fullName: 'Katniss Everdeen',
    slug: 'katniss-everdeen',
    biography: 'The Girl on Fire from District 12, volunteer tribute in the Hunger Games. Her survival skills, defiance of authority, and complex morality make her one of modern fiction\'s most compelling heroines.',
  },
  {
    fullName: 'Holden Caulfield',
    slug: 'holden-caulfield',
    biography: 'The cynical, alienated teenager narrating The Catcher in the Rye. Expelled from prep school, he wanders New York City grappling with grief, growing up, and the phoniness of the adult world.',
  },
];

export async function seedCharacters(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting characters seeding...');
  const characterRepo = ds.getRepository(Character);
  let created = 0;
  let updated = 0;

  for (const character of charactersData) {
    const { created: isNew } = await upsert(characterRepo, { slug: character.slug }, character);
    if (isNew) {
      created++;
      console.log(`✅ Created character: ${character.fullName}`);
    } else {
      updated++;
    }
  }

  logResult('Characters', created, updated);
  console.log('🎉 Characters seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('characters', seedCharacters).catch(() => process.exit(1));
}
