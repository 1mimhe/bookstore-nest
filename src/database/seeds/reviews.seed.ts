import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Author } from '../../modules/authors/entities/author.entity';
import { Blog } from '../../modules/blogs/entities/blog.entity';
import { Book } from '../../modules/books/entities/book.entity';
import { Publisher } from '../../modules/publishers/entities/publisher.entity';
import { Review, ReviewableType } from '../../modules/reviews/entities/review.entity';
import {
  ReactionsEnum,
  ReviewReaction,
} from '../../modules/reviews/entities/review-reaction.entity';
import { User } from '../../modules/users/entities/user.entity';
import { need, runStandalone } from './seed-utils';

interface ReviewSpec {
  username: string;
  target: { kind: 'book-isbn' | 'blog' | 'author' | 'publisher'; ref: string };
  rate: number;
  content: string;
  replyTo?: number;
}

const reviewsData: ReviewSpec[] = [
  { username: 'demo', target: { kind: 'book-isbn', ref: '9786221000013' }, rate: 5, content: 'The Behazin translation reads beautifully. Raskolnikov\'s torment feels terrifyingly modern. A must-read for anyone who enjoys deep psychological fiction.' },
  { username: 'editor', target: { kind: 'book-isbn', ref: '9786221000013' }, rate: 5, content: 'A mountain of a novel. The epilogue alone is worth the climb. Cheshmeh\'s new edition is gorgeous.' },
  { username: 'supporter', target: { kind: 'book-isbn', ref: '9786221000013' }, rate: 4, content: 'Dense in the middle, but the ending lands hard. The philosophical passages are incredible.' },
  { username: 'mehrdad', target: { kind: 'book-isbn', ref: '9786221000013' }, rate: 5, content: 'I\'ve read this three times and discover something new each time. Dostoevsky is unmatched.' },
  { username: 'demo', target: { kind: 'book-isbn', ref: '9786221000136' }, rate: 5, content: 'Bought for my nephew, ended up reading it myself in two nights. Tolkien\'s magic is timeless.' },
  { username: 'zahra', target: { kind: 'book-isbn', ref: '9786221000136' }, rate: 5, content: 'The Hobbit was my childhood and it still makes me smile. A perfect adventure story.' },
  { username: 'publisher1', target: { kind: 'book-isbn', ref: '9786221000150' }, rate: 4, content: 'Short, sharp and still painfully relevant. Every student should read this.' },
  { username: 'demo', target: { kind: 'blog', ref: 'why-crime-and-punishment-still-hurts' }, rate: 5, content: 'This essay convinced me to finally pick up the novel. Brilliant analysis.' },
  { username: 'editor', target: { kind: 'author', ref: 'fyodor-dostoevsky' }, rate: 5, content: 'No one maps guilt like Dostoevsky. His influence on world literature is immeasurable.' },
  { username: 'demo', target: { kind: 'publisher', ref: 'cheshmeh' }, rate: 4, content: 'Careful editions and fair prices. My favourite local publisher.' },
  { username: 'kian', target: { kind: 'publisher', ref: 'cheshmeh' }, rate: 5, content: 'The quality of Cheshmeh translations is consistently excellent. Their Crime and Punishment edition is definitive.' },
  { username: 'supporter', target: { kind: 'book-isbn', ref: '9786221000037' }, rate: 5, content: 'Elizabeth Bennet is the greatest character ever written. Fight me.' },
  { username: 'editor', target: { kind: 'book-isbn', ref: '9786221000037' }, rate: 4, content: 'Charming and sharp; the Nay edition has a helpful introduction.' },
  { username: 'taraneh', target: { kind: 'book-isbn', ref: '9786221000037' }, rate: 5, content: 'I reread this every year. Austen\'s wit never gets old. The pocket edition is perfect for commuting.' },
  { username: 'demo', target: { kind: 'book-isbn', ref: '9786221000211' }, rate: 5, content: 'Heavier than Crime and Punishment and twice as rewarding. The Grand Inquisitor chapter alone...' },
  { username: 'mehrdad', target: { kind: 'book-isbn', ref: '9786221000211' }, rate: 5, content: 'The greatest novel ever written. Every page is a revelation about human nature.' },
  { username: 'supporter', target: { kind: 'book-isbn', ref: '9786221000341' }, rate: 5, content: 'Read it to my daughter; now we duel over who finishes each volume first. Pure magic.' },
  { username: 'neda', target: { kind: 'book-isbn', ref: '9786221000341' }, rate: 5, content: 'Harry Potter shaped my childhood. The Persian translation captures the wonder perfectly.' },
  { username: 'editor', target: { kind: 'book-isbn', ref: '9786221000273' }, rate: 5, content: 'Ninety-six pages that explain being human better than most philosophies.' },
  { username: 'zahra', target: { kind: 'book-isbn', ref: '9786221000273' }, rate: 5, content: 'I cry every time I read "What is essential is invisible to the eye." A masterpiece.' },
  { username: 'demo', target: { kind: 'book-isbn', ref: '9786221000051' }, rate: 5, content: 'The new Cheshmeh edition of 1984 is stunning. Orwell\'s predictions feel more real every year.' },
  { username: 'arash', target: { kind: 'book-isbn', ref: '9786221000051' }, rate: 5, content: 'Essential reading. "Big Brother is watching you" has never felt more relevant.' },
  { username: 'kian', target: { kind: 'book-isbn', ref: '9786221000082' }, rate: 5, content: 'Murakami captures the feeling of being young and lost better than any other writer. This novel broke my heart.' },
  { username: 'taraneh', target: { kind: 'book-isbn', ref: '9786221000082' }, rate: 4, content: 'Beautifully melancholic. The music references add another layer of nostalgia.' },
  { username: 'demo', target: { kind: 'book-isbn', ref: '9786221000105' }, rate: 5, content: 'A strange, haunting book that stays with you long after you finish. Hedayat was a genius.' },
  { username: 'editor', target: { kind: 'author', ref: 'sadegh-hedayat' }, rate: 5, content: 'Hedayat created modern Persian fiction. The Blind Owl is a work of pure, terrifying art.' },
  { username: 'mehrdad', target: { kind: 'book-isbn', ref: '9786221000297' }, rate: 4, content: 'A beautiful, simple fable about following your dreams. Perfect for anyone who needs inspiration.' },
  { username: 'demo', target: { kind: 'book-isbn', ref: '9786221000259' }, rate: 5, content: 'Atticus Finch is the moral hero we all need. This novel changed my perspective on justice.' },
  { username: 'neda', target: { kind: 'blog', ref: 'murakami-for-beginners' }, rate: 5, content: 'Perfect guide! I started with Norwegian Wood thanks to this post and now I\'m reading everything by Murakami.' },
  { username: 'demo', target: { kind: 'blog', ref: 'forough-fifty-years-later' }, rate: 5, content: 'Forough\'s poetry is still so powerful. This essay captures why she matters.' },
  { username: 'supporter', target: { kind: 'book-isbn', ref: '9786221000372' }, rate: 4, content: 'Camus at his most accessible. The Stranger is short but devastating.' },
  { username: 'editor', target: { kind: 'book-isbn', ref: '9786221000372' }, rate: 5, content: '"I opened myself to the gentle indifference of the world." The opening line is iconic for a reason.' },
  { username: 'zahra', target: { kind: 'book-isbn', ref: '9786221000327' }, rate: 5, content: 'Hafez is Hafez. Every Iranian household should have a Divan. This Cheshmeh edition is beautiful.' },
  { username: 'demo', target: { kind: 'book-isbn', ref: '9786221000310' }, rate: 5, content: 'The Shahnameh is Iran. Ferdowsi gave us our identity. This edition is a treasure.' },
  { username: 'editor', target: { kind: 'publisher', ref: 'penguin-classics' }, rate: 5, content: 'Penguin Classics consistently delivers the best editions of world literature. Their introductions alone are worth the price.' },
  { username: 'kian', target: { kind: 'author', ref: 'albert-camus' }, rate: 5, content: 'Camus changed how I think about meaning and existence. The Stranger and The Myth of Sisyphus should be required reading.' },
  { username: 'demo', target: { kind: 'book-isbn', ref: '9786221000235' }, rate: 5, content: 'The Great Gatsby is a perfect novel. Every sentence is polished to a gleam.' },
  { username: 'taraneh', target: { kind: 'book-isbn', ref: '9786221000235' }, rate: 4, content: 'Beautiful prose, tragic story. Fitzgerald captures the glitter and emptiness of the American Dream.' },
];

const reactionsData: { reviewIndex: number; username: string; reaction: ReactionsEnum }[] = [
  { reviewIndex: 0, username: 'editor', reaction: ReactionsEnum.Love },
  { reviewIndex: 0, username: 'supporter', reaction: ReactionsEnum.Like },
  { reviewIndex: 0, username: 'publisher1', reaction: ReactionsEnum.Fire },
  { reviewIndex: 3, username: 'demo', reaction: ReactionsEnum.Like },
  { reviewIndex: 4, username: 'editor', reaction: ReactionsEnum.Fire },
  { reviewIndex: 5, username: 'demo', reaction: ReactionsEnum.Love },
  { reviewIndex: 8, username: 'supporter', reaction: ReactionsEnum.Love },
  { reviewIndex: 10, username: 'publisher1', reaction: ReactionsEnum.Love },
  { reviewIndex: 11, username: 'editor', reaction: ReactionsEnum.Like },
  { reviewIndex: 15, username: 'demo', reaction: ReactionsEnum.Fire },
  { reviewIndex: 16, username: 'neda', reaction: ReactionsEnum.Love },
  { reviewIndex: 18, username: 'zahra', reaction: ReactionsEnum.Like },
  { reviewIndex: 19, username: 'demo', reaction: ReactionsEnum.Love },
  { reviewIndex: 20, username: 'arash', reaction: ReactionsEnum.Fire },
  { reviewIndex: 22, username: 'taraneh', reaction: ReactionsEnum.Love },
  { reviewIndex: 27, username: 'demo', reaction: ReactionsEnum.Like },
  { reviewIndex: 28, username: 'editor', reaction: ReactionsEnum.Fire },
  { reviewIndex: 31, username: 'demo', reaction: ReactionsEnum.Love },
  { reviewIndex: 33, username: 'kian', reaction: ReactionsEnum.Like },
  { reviewIndex: 35, username: 'demo', reaction: ReactionsEnum.Fire },
  { reviewIndex: 36, username: 'editor', reaction: ReactionsEnum.Love },
  { reviewIndex: 37, username: 'taraneh', reaction: ReactionsEnum.Like },
];

const reactionCounter: Record<ReactionsEnum, 'likeCount' | 'dislikeCount' | 'loveCount' | 'fireCount' | 'tomatoCount'> = {
  [ReactionsEnum.Like]: 'likeCount',
  [ReactionsEnum.Dislike]: 'dislikeCount',
  [ReactionsEnum.Love]: 'loveCount',
  [ReactionsEnum.Fire]: 'fireCount',
  [ReactionsEnum.Tomato]: 'tomatoCount',
};

export async function seedReviews(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting reviews seeding...');
  const reviewRepo = ds.getRepository(Review);
  const reactionRepo = ds.getRepository(ReviewReaction);
  const userRepo = ds.getRepository(User);
  const bookRepo = ds.getRepository(Book);
  const blogRepo = ds.getRepository(Blog);
  const authorRepo = ds.getRepository(Author);
  const publisherRepo = ds.getRepository(Publisher);

  const userIds: Record<string, string> = {};
  for (const username of ['demo', 'editor', 'supporter', 'publisher1', 'mehrdad', 'zahra', 'kian', 'taraneh', 'arash', 'neda']) {
    userIds[username] = (await need(userRepo, { username }, `user:${username}`)).id;
  }

  async function resolveTarget(target: ReviewSpec['target']): Promise<{
    type: ReviewableType;
    id: string;
  }> {
    if (target.kind === 'book-isbn') {
      const book = await need(bookRepo, { ISBN: target.ref }, `book:${target.ref}`);
      return { type: ReviewableType.Book, id: book.id };
    }
    if (target.kind === 'blog') {
      const blog = await need(blogRepo, { slug: target.ref }, `blog:${target.ref}`);
      return { type: ReviewableType.Blog, id: blog.id };
    }
    if (target.kind === 'author') {
      const author = await need(authorRepo, { slug: target.ref }, `author:${target.ref}`);
      return { type: ReviewableType.Author, id: author.id };
    }
    const publisher = await need(publisherRepo, { slug: target.ref }, `publisher:${target.ref}`);
    return { type: ReviewableType.Publisher, id: publisher.id };
  }

  const reviewIds: string[] = [];
  let created = 0;
  let updated = 0;

  for (const spec of reviewsData) {
    const { type, id } = await resolveTarget(spec.target);
    const userId = userIds[spec.username];
    const parentId = spec.replyTo !== undefined ? reviewIds[spec.replyTo] : undefined;
    if (spec.replyTo !== undefined && !parentId) {
      throw new Error(`Reply target index ${spec.replyTo} was not seeded yet`);
    }

    const candidates = await reviewRepo.find({
      where: { reviewableType: type, reviewableId: id, userId },
    });
    let review = candidates.find((r) => (r.parentReviewId ?? undefined) === parentId);

    if (!review) {
      review = await reviewRepo.save(
        reviewRepo.create({
          content: spec.content,
          rate: spec.rate,
          reviewableType: type,
          reviewableId: id,
          userId,
          parentReviewId: parentId,
        }),
      );
      created++;
      console.log(`✅ Created review by ${spec.username} on ${type}:${id.slice(0, 8)}`);
    } else {
      await reviewRepo.update(review.id, { content: spec.content, rate: spec.rate });
      updated++;
    }
    reviewIds.push(review.id);

    if (parentId) {
      const count = await reviewRepo.count({ where: { parentReviewId: parentId } });
      await reviewRepo.update(parentId, { repliesCount: count });
    }
  }

  for (const row of reactionsData) {
    const reviewId = reviewIds[row.reviewIndex];
    const userId = userIds[row.username];
    const existing = await reactionRepo.findOne({ where: { reviewId, userId } });
    if (!existing) {
      await reactionRepo.save(
        reactionRepo.create({ reviewId, userId, reaction: row.reaction }),
      );
      console.log(`✅ Reaction ${row.reaction} by ${row.username}`);
    } else if (existing.reaction !== row.reaction) {
      await reactionRepo.update(existing.id, { reaction: row.reaction });
    }
  }

  for (const reviewId of new Set(reviewIds)) {
    const reactions = await reactionRepo.find({ where: { reviewId } });
    const patch: Record<string, number> = { likeCount: 0, dislikeCount: 0, loveCount: 0, fireCount: 0, tomatoCount: 0 };
    for (const reaction of reactions) patch[reactionCounter[reaction.reaction]]++;
    await reviewRepo.update(reviewId, patch);
  }

  const bookTargets = new Map<string, { sum: number; count: number }>();
  for (let i = 0; i < reviewsData.length; i++) {
    const spec = reviewsData[i];
    if (spec.target.kind !== 'book-isbn' || spec.replyTo !== undefined) continue;
    const book = await bookRepo.findOne({ where: { ISBN: spec.target.ref } });
    if (!book) continue;
    const agg = bookTargets.get(book.id) ?? { sum: 0, count: 0 };
    agg.sum += spec.rate;
    agg.count++;
    bookTargets.set(book.id, agg);
  }
  for (const [bookId, agg] of bookTargets) {
    await bookRepo.update(bookId, {
      rate: Math.round((agg.sum / agg.count) * 10) / 10,
      rateCount: agg.count,
    });
  }

  console.log(`📊 Reviews: ${created} created, ${updated} already existed`);
  console.log('🎉 Reviews seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('reviews', seedReviews).catch(() => process.exit(1));
}
