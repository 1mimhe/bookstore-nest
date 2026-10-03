import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Author } from '../../modules/authors/entities/author.entity';
import { Book, Covers, Quartos } from '../../modules/books/entities/book.entity';
import { BookImage, BookImageTypes } from '../../modules/books/entities/book-image.entity';
import { Title } from '../../modules/books/entities/title.entity';
import { Language } from '../../modules/languages/entities/language.entity';
import { Publisher } from '../../modules/publishers/entities/publisher.entity';
import { linkManyToMany, logResult, need, runStandalone, upsert } from './seed-utils';

interface BookSpec {
  titleSlug: string;
  publisherSlug: string;
  languageCode: string;
  name: string;
  anotherName?: string;
  isbn: string;
  quarto?: Quartos;
  cover?: Covers;
  pagesNumber?: number;
  publishedAt: Date;
  publishSeries?: number;
  weight?: number;
  stock: number;
  price: number;
  discountPercent?: number;
  sold?: number;
  translatorSlugs?: string[];
}

const booksData: BookSpec[] = [
  { titleSlug: 'crime-and-punishment', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'جنایت و مکافات', anotherName: 'Crime and Punishment', isbn: '9786221000013', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 672, publishedAt: new Date('2023-05-10'), publishSeries: 3, weight: 850, stock: 24, price: 385000, discountPercent: 0.1, sold: 130, translatorSlugs: ['behazin'] },
  { titleSlug: 'crime-and-punishment', publisherSlug: 'penguin-classics', languageCode: 'en', name: 'Crime and Punishment', isbn: '9780141439518', quarto: Quartos.Vaziri, cover: Covers.Kaqazi, pagesNumber: 671, publishedAt: new Date('2022-02-01'), publishSeries: 1, weight: 700, stock: 12, price: 520000, sold: 60 },
  { titleSlug: 'crime-and-punishment', publisherSlug: 'amir-kabir', languageCode: 'fa', name: 'جنایت و مکافات (ویراست تازه)', anotherName: 'Crime and Punishment new ed', isbn: '9786221000014', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 700, publishedAt: new Date('2024-06-15'), publishSeries: 1, weight: 900, stock: 15, price: 420000, discountPercent: 0.05, sold: 45, translatorSlugs: ['behazin'] },
  { titleSlug: 'pride-and-prejudice', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'غرور و تعصب', anotherName: 'Pride and Prejudice', isbn: '9786221000037', quarto: Quartos.Vaziri, cover: Covers.Shoomiz, pagesNumber: 432, publishedAt: new Date('2023-09-14'), publishSeries: 2, weight: 560, stock: 30, price: 295000, discountPercent: 0.15, sold: 210, translatorSlugs: ['dariush-ashuri'] },
  { titleSlug: 'pride-and-prejudice', publisherSlug: 'penguin-classics', languageCode: 'en', name: 'Pride and Prejudice', isbn: '9780141439510', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 432, publishedAt: new Date('2021-11-20'), publishSeries: 1, weight: 320, stock: 9, price: 480000, sold: 45 },
  { titleSlug: '1984', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'هزار و نهصد و هشتاد و چهار', anotherName: 'Nineteen Eighty-Four', isbn: '9786221000051', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 328, publishedAt: new Date('2024-01-18'), publishSeries: 5, weight: 480, stock: 40, price: 265000, discountPercent: 0.2, sold: 340, translatorSlugs: ['behazin'] },
  { titleSlug: '1984', publisherSlug: 'harper-collins', languageCode: 'en', name: 'Nineteen Eighty-Four', isbn: '9780008322069', quarto: Quartos.Vaziri, cover: Covers.Shoomiz, pagesNumber: 328, publishedAt: new Date('2022-07-07'), publishSeries: 1, weight: 450, stock: 15, price: 610000, discountPercent: 0.05, sold: 90 },
  { titleSlug: 'murder-on-the-orient-express', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'قتل در قطار سریع‌السیر شرق', isbn: '9786221000075', quarto: Quartos.Roqee, cover: Covers.Kaqazi, pagesNumber: 256, publishedAt: new Date('2023-03-02'), publishSeries: 1, weight: 300, stock: 18, price: 215000, sold: 120, translatorSlugs: ['dariush-ashuri'] },
  { titleSlug: 'murder-on-the-orient-express', publisherSlug: 'harper-collins', languageCode: 'en', name: 'Murder on the Orient Express', isbn: '9780008322076', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 256, publishedAt: new Date('2022-11-10'), publishSeries: 1, weight: 280, stock: 11, price: 430000, sold: 65 },
  { titleSlug: 'norwegian-wood', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'جنگل نروژی', anotherName: 'Norwegian Wood', isbn: '9786221000082', quarto: Quartos.Vaziri, cover: Covers.Shoomiz, pagesNumber: 296, publishedAt: new Date('2023-08-25'), publishSeries: 2, weight: 410, stock: 22, price: 275000, discountPercent: 0.1, sold: 150, translatorSlugs: ['behazin'] },
  { titleSlug: 'norwegian-wood', publisherSlug: 'harper-collins', languageCode: 'en', name: 'Norwegian Wood', isbn: '9780099448822', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 296, publishedAt: new Date('2021-05-30'), publishSeries: 1, weight: 280, stock: 7, price: 540000, sold: 38 },
  { titleSlug: 'the-blind-owl', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'بوف کور', anotherName: 'The Blind Owl', isbn: '9786221000105', quarto: Quartos.Jibi, cover: Covers.Shoomiz, pagesNumber: 120, publishedAt: new Date('2024-02-11'), publishSeries: 7, weight: 180, stock: 35, price: 145000, sold: 260 },
  { titleSlug: 'the-blind-owl', publisherSlug: 'penguin-classics', languageCode: 'en', name: 'The Blind Owl', isbn: '9780141183398', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 120, publishedAt: new Date('2020-10-12'), publishSeries: 1, weight: 170, stock: 6, price: 390000, sold: 25, translatorSlugs: ['dariush-ashuri'] },
  { titleSlug: 'another-birth', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'تولدی دیگر', anotherName: 'Another Birth', isbn: '9786221000129', quarto: Quartos.Roqee, cover: Covers.Sakht, pagesNumber: 160, publishedAt: new Date('2023-12-01'), publishSeries: 4, weight: 260, stock: 20, price: 195000, discountPercent: 0.05, sold: 140 },
  { titleSlug: 'another-birth', publisherSlug: 'susa', languageCode: 'fa', name: 'تولدی دیگر (ویراست انتقادی)', anotherName: 'Another Birth critical ed', isbn: '9786221000130', quarto: Quartos.Roqee, cover: Covers.Kaqazi, pagesNumber: 180, publishedAt: new Date('2024-08-20'), publishSeries: 1, weight: 270, stock: 12, price: 225000, sold: 30 },
  { titleSlug: 'the-hobbit', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'هابیت', anotherName: 'The Hobbit', isbn: '9786221000136', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 310, publishedAt: new Date('2023-06-19'), publishSeries: 2, weight: 470, stock: 28, price: 325000, discountPercent: 0.15, sold: 190, translatorSlugs: ['behazin'] },
  { titleSlug: 'the-hobbit', publisherSlug: 'harper-collins', languageCode: 'en', name: 'The Hobbit', anotherName: 'Deluxe Edition', isbn: '9780007487240', quarto: Quartos.Vaziri, cover: Covers.Charmi, pagesNumber: 310, publishedAt: new Date('2022-09-09'), publishSeries: 1, weight: 620, stock: 5, price: 980000, sold: 30 },
  { titleSlug: 'the-hobbit', publisherSlug: 'amir-kabir', languageCode: 'fa', name: 'هابیت (ویراست ویژه)', anotherName: 'The Hobbit special ed', isbn: '9786221000137', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 320, publishedAt: new Date('2024-03-01'), publishSeries: 1, weight: 500, stock: 10, price: 380000, sold: 25, translatorSlugs: ['behazin'] },
  { titleSlug: 'animal-farm', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'قلعه حیوانات', anotherName: 'Animal Farm', isbn: '9786221000150', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 112, publishedAt: new Date('2024-04-03'), publishSeries: 9, weight: 150, stock: 45, price: 125000, discountPercent: 0.2, sold: 410, translatorSlugs: ['dariush-ashuri'] },
  { titleSlug: 'animal-farm', publisherSlug: 'penguin-classics', languageCode: 'en', name: 'Animal Farm', isbn: '9780141393056', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 112, publishedAt: new Date('2021-03-15'), publishSeries: 1, weight: 140, stock: 11, price: 350000, sold: 70 },
  { titleSlug: 'and-then-there-were-none', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'و آنگاه هیچ‌کس نماند', isbn: '9786221000174', quarto: Quartos.Roqee, cover: Covers.Shoomiz, pagesNumber: 272, publishedAt: new Date('2023-10-27'), publishSeries: 1, weight: 330, stock: 16, price: 235000, discountPercent: 0.1, sold: 110, translatorSlugs: ['behazin'] },
  { titleSlug: 'and-then-there-were-none', publisherSlug: 'harper-collins', languageCode: 'en', name: 'And Then There Were None', isbn: '9780007129683', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 272, publishedAt: new Date('2022-12-05'), publishSeries: 1, weight: 260, stock: 8, price: 460000, sold: 52 },
  { titleSlug: 'pride-and-prejudice', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'غرور و تعصب (جیبی)', anotherName: 'Pride and Prejudice pocket', isbn: '9786221000198', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 432, publishedAt: new Date('2024-06-06'), publishSeries: 1, weight: 300, stock: 50, price: 165000, discountPercent: 0.25, sold: 180, translatorSlugs: ['dariush-ashuri'] },
  { titleSlug: 'the-hobbit', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'هابیت (جیبی)', anotherName: 'The Hobbit pocket', isbn: '9786221000204', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 310, publishedAt: new Date('2024-07-21'), publishSeries: 1, weight: 290, stock: 33, price: 185000, discountPercent: 0.1, sold: 95, translatorSlugs: ['behazin'] },
  { titleSlug: 'the-brothers-karamazov', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'برادران کارامازوف', anotherName: 'The Brothers Karamazov', isbn: '9786221000211', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 824, publishedAt: new Date('2023-04-17'), publishSeries: 2, weight: 1050, stock: 20, price: 445000, discountPercent: 0.1, sold: 85, translatorSlugs: ['behazin'] },
  { titleSlug: 'the-brothers-karamazov', publisherSlug: 'penguin-classics', languageCode: 'en', name: 'The Brothers Karamazov', isbn: '9780140449136', quarto: Quartos.Vaziri, cover: Covers.Kaqazi, pagesNumber: 824, publishedAt: new Date('2021-08-02'), publishSeries: 1, weight: 900, stock: 8, price: 680000, sold: 40 },
  { titleSlug: 'the-great-gatsby', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'گتسبی بزرگ', anotherName: 'The Great Gatsby', isbn: '9786221000235', quarto: Quartos.Roqee, cover: Covers.Shoomiz, pagesNumber: 180, publishedAt: new Date('2023-07-11'), publishSeries: 3, weight: 250, stock: 26, price: 245000, discountPercent: 0.15, sold: 170, translatorSlugs: ['dariush-ashuri'] },
  { titleSlug: 'the-great-gatsby', publisherSlug: 'penguin-classics', languageCode: 'en', name: 'The Great Gatsby', isbn: '9780141182636', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 180, publishedAt: new Date('2020-05-19'), publishSeries: 1, weight: 200, stock: 10, price: 420000, sold: 65 },
  { titleSlug: 'to-kill-a-mockingbird', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'کشتن مرغ مقلد', anotherName: 'To Kill a Mockingbird', isbn: '9786221000259', quarto: Quartos.Vaziri, cover: Covers.Shoomiz, pagesNumber: 281, publishedAt: new Date('2023-11-30'), publishSeries: 1, weight: 400, stock: 24, price: 295000, discountPercent: 0.1, sold: 145, translatorSlugs: ['behazin'] },
  { titleSlug: 'to-kill-a-mockingbird', publisherSlug: 'harper-collins', languageCode: 'en', name: 'To Kill a Mockingbird', isbn: '9780060935467', quarto: Quartos.Vaziri, cover: Covers.Kaqazi, pagesNumber: 281, publishedAt: new Date('2022-04-22'), publishSeries: 1, weight: 380, stock: 9, price: 510000, sold: 55 },
  { titleSlug: 'the-little-prince', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'شازده کوچولو', anotherName: 'The Little Prince', isbn: '9786221000273', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 96, publishedAt: new Date('2024-03-08'), publishSeries: 6, weight: 220, stock: 48, price: 135000, discountPercent: 0.05, sold: 380 },
  { titleSlug: 'the-little-prince', publisherSlug: 'harper-collins', languageCode: 'en', name: 'The Little Prince', isbn: '9780007150830', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 96, publishedAt: new Date('2021-09-14'), publishSeries: 1, weight: 150, stock: 12, price: 320000, sold: 80 },
  { titleSlug: 'the-alchemist', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'کیمیاگر', anotherName: 'The Alchemist', isbn: '9786221000297', quarto: Quartos.Roqee, cover: Covers.Shoomiz, pagesNumber: 208, publishedAt: new Date('2023-05-23'), publishSeries: 4, weight: 280, stock: 30, price: 225000, discountPercent: 0.2, sold: 230, translatorSlugs: ['behazin'] },
  { titleSlug: 'the-alchemist', publisherSlug: 'harper-collins', languageCode: 'en', name: 'The Alchemist', isbn: '9780061122415', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 208, publishedAt: new Date('2020-12-01'), publishSeries: 1, weight: 210, stock: 10, price: 440000, sold: 75 },
  { titleSlug: 'shahnameh', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'شاهنامه فردوسی', anotherName: 'Shahnameh', isbn: '9786221000310', quarto: Quartos.Sultani, cover: Covers.Charmi, pagesNumber: 1200, publishedAt: new Date('2022-03-21'), publishSeries: 1, weight: 2400, stock: 10, price: 780000, discountPercent: 0.05, sold: 60 },
  { titleSlug: 'shahnameh', publisherSlug: 'amir-kabir', languageCode: 'fa', name: 'شاهنامه (ویراست جلدی)', anotherName: 'Shahnameh box set', isbn: '9786221000311', quarto: Quartos.Sultani, cover: Covers.Charmi, pagesNumber: 1200, publishedAt: new Date('2023-09-21'), publishSeries: 1, weight: 2500, stock: 8, price: 950000, sold: 35 },
  { titleSlug: 'divan-e-hafez', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'دیوان حافظ', anotherName: 'Divan-e Hafez', isbn: '9786221000327', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 480, publishedAt: new Date('2023-02-14'), publishSeries: 3, weight: 700, stock: 22, price: 265000, sold: 150 },
  { titleSlug: 'divan-e-hafez', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'دیوان حافظ (جیبی)', anotherName: 'Divan-e Hafez pocket', isbn: '9786221000334', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 480, publishedAt: new Date('2024-01-05'), publishSeries: 1, weight: 350, stock: 36, price: 175000, discountPercent: 0.15, sold: 120 },
  { titleSlug: 'divan-e-hafez', publisherSlug: 'susa', languageCode: 'fa', name: 'دیوان حافظ (نقد و تصحیح)', anotherName: 'Divan-e Hafez critical', isbn: '9786221000335', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 520, publishedAt: new Date('2024-05-10'), publishSeries: 1, weight: 750, stock: 10, price: 340000, sold: 40 },
  { titleSlug: 'harry-potter-1', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'هری پاتر و سنگ جادو', anotherName: "Harry Potter and the Philosopher's Stone", isbn: '9786221000341', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 309, publishedAt: new Date('2023-09-01'), publishSeries: 2, weight: 460, stock: 32, price: 345000, discountPercent: 0.15, sold: 260, translatorSlugs: ['behazin'] },
  { titleSlug: 'harry-potter-1', publisherSlug: 'harper-collins', languageCode: 'en', name: "Harry Potter and the Philosopher's Stone", isbn: '9780747532699', quarto: Quartos.Vaziri, cover: Covers.Shoomiz, pagesNumber: 309, publishedAt: new Date('2022-06-15'), publishSeries: 1, weight: 440, stock: 14, price: 590000, sold: 110 },
  { titleSlug: 'the-lord-of-the-rings', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'ارباب حلقه‌ها', anotherName: 'The Lord of the Rings', isbn: '9786221000365', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 1178, publishedAt: new Date('2023-12-20'), publishSeries: 1, weight: 1500, stock: 18, price: 890000, discountPercent: 0.1, sold: 100, translatorSlugs: ['dariush-ashuri'] },
  { titleSlug: 'the-lord-of-the-rings', publisherSlug: 'harper-collins', languageCode: 'en', name: 'The Lord of the Rings', isbn: '9780007525546', quarto: Quartos.Vaziri, cover: Covers.Charmi, pagesNumber: 1178, publishedAt: new Date('2022-10-10'), publishSeries: 1, weight: 1700, stock: 6, price: 1200000, sold: 45 },
  { titleSlug: 'the-stranger', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'بیگانه', anotherName: 'The Stranger', isbn: '9786221000372', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 140, publishedAt: new Date('2024-01-20'), publishSeries: 1, weight: 200, stock: 25, price: 155000, discountPercent: 0.1, sold: 95, translatorSlugs: ['behazin'] },
  { titleSlug: 'the-stranger', publisherSlug: 'penguin-classics', languageCode: 'en', name: 'The Stranger', isbn: '9780141182551', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 128, publishedAt: new Date('2021-06-01'), publishSeries: 1, weight: 180, stock: 10, price: 380000, sold: 55 },
  { titleSlug: 'the-metamorphosis', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'مسخ', anotherName: 'The Metamorphosis', isbn: '9786221000389', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 80, publishedAt: new Date('2024-02-15'), publishSeries: 2, weight: 120, stock: 40, price: 115000, sold: 120 },
  { titleSlug: 'the-metamorphosis', publisherSlug: 'harper-collins', languageCode: 'en', name: 'The Metamorphosis', isbn: '9780007249893', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 80, publishedAt: new Date('2021-04-10'), publishSeries: 1, weight: 130, stock: 12, price: 310000, sold: 60 },
  { titleSlug: 'one-hundred-years-of-solitude', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'صد سال تنهایی', anotherName: 'One Hundred Years of Solitude', isbn: '9786221000396', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 480, publishedAt: new Date('2023-06-01'), publishSeries: 1, weight: 600, stock: 18, price: 345000, discountPercent: 0.1, sold: 85, translatorSlugs: ['behazin'] },
  { titleSlug: 'one-hundred-years-of-solitude', publisherSlug: 'harper-collins', languageCode: 'en', name: 'One Hundred Years of Solitude', isbn: '9780060883287', quarto: Quartos.Vaziri, cover: Covers.Kaqazi, pagesNumber: 422, publishedAt: new Date('2022-03-15'), publishSeries: 1, weight: 550, stock: 8, price: 620000, sold: 42 },
  { titleSlug: 'the-unbearable-lightness-of-being', publisherSlug: 'nashr-nay', languageCode: 'fa', name: '.borderline sophisticated', anotherName: 'The Unbearable Lightness of Being', isbn: '9786221000402', quarto: Quartos.Roqee, cover: Covers.Shoomiz, pagesNumber: 350, publishedAt: new Date('2023-09-10'), publishSeries: 1, weight: 420, stock: 14, price: 285000, sold: 65 },
  { titleSlug: 'the-unbearable-lightness-of-being', publisherSlug: 'penguin-classics', languageCode: 'en', name: 'The Unbearable Lightness of Being', isbn: '9780061120213', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 326, publishedAt: new Date('2021-07-20'), publishSeries: 1, weight: 350, stock: 7, price: 490000, sold: 38 },
  { titleSlug: 'the-second-sex', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'جنس دوم', anotherName: 'The Second Sex', isbn: '9786221000419', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 780, publishedAt: new Date('2024-03-08'), publishSeries: 1, weight: 950, stock: 12, price: 480000, sold: 40, translatorSlugs: ['dariush-ashuri'] },
  { titleSlug: 'the-grasshopper', publisherSlug: 'cheshmeh', languageCode: 'fa', name: 'سه قصه', anotherName: 'The Grasshopper', isbn: '9786221000426', quarto: Quartos.Jibi, cover: Covers.Kaqazi, pagesNumber: 200, publishedAt: new Date('2024-01-25'), publishSeries: 3, weight: 250, stock: 18, price: 175000, sold: 55 },
  { titleSlug: 'the-girl-with-the-dragon-tattoo', publisherSlug: 'random-house', languageCode: 'en', name: 'The Girl with the Dragon Tattoo', isbn: '9780307949486', quarto: Quartos.Vaziri, cover: Covers.Shoomiz, pagesNumber: 672, publishedAt: new Date('2022-08-01'), publishSeries: 1, weight: 750, stock: 16, price: 520000, discountPercent: 0.1, sold: 75 },
  { titleSlug: 'the-girl-with-the-dragon-tattoo', publisherSlug: 'nashr-nay', languageCode: 'fa', name: 'دختری با خالکوبی اژدها', anotherName: 'The Girl with the Dragon Tattoo', isbn: '9786221000433', quarto: Quartos.Vaziri, cover: Covers.Sakht, pagesNumber: 680, publishedAt: new Date('2023-11-15'), publishSeries: 1, weight: 800, stock: 20, price: 385000, discountPercent: 0.15, sold: 95 },
];

export async function seedBooks(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting books seeding...');
  const bookRepo = ds.getRepository(Book);
  const titleRepo = ds.getRepository(Title);
  const publisherRepo = ds.getRepository(Publisher);
  const languageRepo = ds.getRepository(Language);
  const authorRepo = ds.getRepository(Author);
  const imageRepo = ds.getRepository(BookImage);
  let created = 0;
  let updated = 0;

  for (const spec of booksData) {
    const title = await need(titleRepo, { slug: spec.titleSlug }, `title:${spec.titleSlug}`);
    const publisher = await need(
      publisherRepo,
      { slug: spec.publisherSlug },
      `publisher:${spec.publisherSlug}`,
    );
    const language = await need(
      languageRepo,
      { code: spec.languageCode },
      `language:${spec.languageCode}`,
    );

    const { entity: book, created: isNew } = await upsert(
      bookRepo,
      { ISBN: spec.isbn },
      {
        name: spec.name,
        anotherName: spec.anotherName,
        ISBN: spec.isbn,
        quarto: spec.quarto,
        cover: spec.cover,
        pagesNumber: spec.pagesNumber,
        publishedAt: spec.publishedAt,
        publishSeries: spec.publishSeries,
        weight: spec.weight,
        stock: spec.stock,
        price: spec.price,
        discountPercent: spec.discountPercent ?? 0,
        sold: spec.sold ?? 0,
        titleId: title.id,
        publisherId: publisher.id,
        languageId: language.id,
      },
    );
    if (isNew) {
      created++;
      console.log(`✅ Created book: ${spec.name} (${spec.isbn})`);
    } else {
      updated++;
    }

    for (const slug of spec.translatorSlugs ?? []) {
      const translator = await need(authorRepo, { slug }, `author:${slug}`);
      await linkManyToMany(ds, Author, 'books', translator.id, [book.id]);
    }

    const coverUrl = `https://covers.openlibrary.org/b/isbn/${spec.isbn}-L.jpg`;
    const images = [
      { type: BookImageTypes.Main, url: coverUrl },
      { type: BookImageTypes.Back, url: `https://picsum.photos/seed/${spec.isbn}-back/400/600` },
    ];
    for (const image of images) {
      const exists = await imageRepo.findOne({
        where: { bookId: book.id, type: image.type, url: image.url },
      });
      if (!exists) {
        await imageRepo.save(imageRepo.create({ ...image, bookId: book.id }));
      }
    }
  }

  for (const spec of booksData) {
    const title = await titleRepo.findOne({ where: { slug: spec.titleSlug } });
    if (title && !title.defaultBookId) {
      const first = await bookRepo.findOne({
        where: { titleId: title.id, ISBN: spec.isbn },
      });
      if (first) {
        await titleRepo.update(title.id, { defaultBookId: first.id });
      }
    }
  }

  logResult('Books', created, updated);
  console.log('🎉 Books seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('books', seedBooks).catch(() => process.exit(1));
}
