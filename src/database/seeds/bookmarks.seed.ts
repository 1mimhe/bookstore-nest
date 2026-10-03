import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Book } from '../../modules/books/entities/book.entity';
import { Bookmark, BookmarkTypes } from '../../modules/books/entities/bookmark.entity';
import { User } from '../../modules/users/entities/user.entity';
import { logResult, need, runStandalone, upsert } from './seed-utils';

const bookmarksData: { username: string; isbn: string; type: BookmarkTypes }[] = [
  // demo user bookmarks
  { username: 'demo', isbn: '9786221000013', type: BookmarkTypes.Library },
  { username: 'demo', isbn: '9786221000136', type: BookmarkTypes.Library },
  { username: 'demo', isbn: '9780007487240', type: BookmarkTypes.Library },
  { username: 'demo', isbn: '9786221000150', type: BookmarkTypes.Loved },
  { username: 'demo', isbn: '9786221000037', type: BookmarkTypes.Loved },
  { username: 'demo', isbn: '9786221000105', type: BookmarkTypes.Read },
  { username: 'demo', isbn: '9786221000211', type: BookmarkTypes.Library },
  { username: 'demo', isbn: '9786221000273', type: BookmarkTypes.Loved },
  { username: 'demo', isbn: '9786221000051', type: BookmarkTypes.Loved },
  { username: 'demo', isbn: '9786221000372', type: BookmarkTypes.Read },
  { username: 'demo', isbn: '9786221000297', type: BookmarkTypes.Loved },
  // mehrdad bookmarks
  { username: 'mehrdad', isbn: '9786221000013', type: BookmarkTypes.Loved },
  { username: 'mehrdad', isbn: '9786221000211', type: BookmarkTypes.Loved },
  { username: 'mehrdad', isbn: '9786221000051', type: BookmarkTypes.Library },
  { username: 'mehrdad', isbn: '9786221000389', type: BookmarkTypes.Read },
  { username: 'mehrdad', isbn: '9786221000372', type: BookmarkTypes.Library },
  { username: 'mehrdad', isbn: '9780008322069', type: BookmarkTypes.Library },
  // zahra bookmarks
  { username: 'zahra', isbn: '9786221000037', type: BookmarkTypes.Loved },
  { username: 'zahra', isbn: '9786221000273', type: BookmarkTypes.Loved },
  { username: 'zahra', isbn: '9786221000327', type: BookmarkTypes.Library },
  { username: 'zahra', isbn: '9786221000129', type: BookmarkTypes.Library },
  { username: 'zahra', isbn: '9786221000082', type: BookmarkTypes.Read },
  // kian bookmarks
  { username: 'kian', isbn: '9786221000372', type: BookmarkTypes.Loved },
  { username: 'kian', isbn: '9786221000051', type: BookmarkTypes.Loved },
  { username: 'kian', isbn: '9786221000105', type: BookmarkTypes.Library },
  { username: 'kian', isbn: '9786221000389', type: BookmarkTypes.Read },
  { username: 'kian', isbn: '9786221000259', type: BookmarkTypes.Library },
  // taraneh bookmarks
  { username: 'taraneh', isbn: '9786221000082', type: BookmarkTypes.Loved },
  { username: 'taraneh', isbn: '9786221000037', type: BookmarkTypes.Library },
  { username: 'taraneh', isbn: '9786221000235', type: BookmarkTypes.Loved },
  { username: 'taraneh', isbn: '9786221000273', type: BookmarkTypes.Library },
  // neda bookmarks
  { username: 'neda', isbn: '9786221000341', type: BookmarkTypes.Loved },
  { username: 'neda', isbn: '9780008322069', type: BookmarkTypes.Loved },
  { username: 'neda', isbn: '9786221000136', type: BookmarkTypes.Library },
  { username: 'neda', isbn: '9786221000365', type: BookmarkTypes.Library },
  // arash bookmarks
  { username: 'arash', isbn: '9786221000051', type: BookmarkTypes.Loved },
  { username: 'arash', isbn: '9780008322069', type: BookmarkTypes.Library },
  { username: 'arash', isbn: '9786221000259', type: BookmarkTypes.Library },
];

export async function seedBookmarks(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting bookmarks seeding...');
  const bookmarkRepo = ds.getRepository(Bookmark);
  const userRepo = ds.getRepository(User);
  const bookRepo = ds.getRepository(Book);
  let created = 0;
  let updated = 0;

  for (const row of bookmarksData) {
    const user = await need(userRepo, { username: row.username }, `user:${row.username}`);
    const book = await need(bookRepo, { ISBN: row.isbn }, `book:${row.isbn}`);
    const { created: isNew } = await upsert(
      bookmarkRepo,
      { userId: user.id, bookId: book.id, type: row.type },
      { userId: user.id, bookId: book.id, type: row.type },
    );
    if (isNew) {
      created++;
      console.log(`✅ Bookmarked "${book.name}" as ${row.type} for ${row.username}`);
    } else {
      updated++;
    }
  }

  for (const book of await bookRepo.find()) {
    const n = await bookmarkRepo.count({ where: { bookId: book.id } });
    if (book.bookmarkCount !== n) {
      await bookRepo.update(book.id, { bookmarkCount: n });
    }
  }

  const allUsers = ['demo', 'mehrdad', 'zahra', 'kian', 'taraneh', 'neda', 'arash'];
  for (const username of allUsers) {
    const user = await need(userRepo, { username }, `user:${username}`);
    const count = await bookmarkRepo.count({ where: { userId: user.id } });
    console.log(`🔖 ${username} now has ${count} bookmarks`);
  }

  logResult('Bookmarks', created, updated);
  console.log('🎉 Bookmarks seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('bookmarks', seedBookmarks).catch(() => process.exit(1));
}
