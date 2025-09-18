import { DataSource, Repository } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

// Define the TagType enum
export enum TagType {
  ThematicCategory = 'thematic_category',
  StoryType = 'story_type',
  FeaturedBooks = 'featured_books',
  LiteratureAward = 'literature_award',
  NationLiterature = 'nation_literature',
  SystemTags = 'system_tags',
  Collection = 'collection',
  AgeGroup = 'age_group',
  MoodTheme = 'mood_theme',
  TimePeriod = 'time_period',
  ContentWarnings = 'content_warnings',
  DifficultyLevel = 'difficulty_level'
}

// Define the Tag entity inline to avoid import issues
@Entity('tags')
@Unique('TAG_NAME', ['name'])
@Index(['slug'], { unique: true })
class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TagType
  })
  type: TagType;

  @Column({ nullable: true })
  color?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

const tagsData = [
  // Thematic Category
  {
    name: 'ادبیات داستانی',
    slug: 'fiction-literature',
    type: TagType.ThematicCategory,
    description: 'آثار داستانی و ادبیات تخیلی',
    color: '#3B82F6'
  },
  {
    name: 'توسعه فردی',
    slug: 'self-development',
    type: TagType.ThematicCategory,
    description: 'کتاب‌های رشد شخصی و خودسازی',
    color: '#10B981'
  },
  {
    name: 'روانشناسی',
    slug: 'psychology',
    type: TagType.ThematicCategory,
    description: 'کتاب‌های علم روانشناسی',
    color: '#8B5CF6'
  },
  {
    name: 'فلسفه',
    slug: 'philosophy',
    type: TagType.ThematicCategory,
    description: 'آثار فلسفی و اندیشه',
    color: '#F59E0B'
  },
  {
    name: 'داستان کوتاه',
    slug: 'short-story',
    type: TagType.ThematicCategory,
    description: 'مجموعه داستان‌های کوتاه',
    color: '#EF4444'
  },
  {
    name: 'ادبیات نمایشی',
    slug: 'drama-literature',
    type: TagType.ThematicCategory,
    description: 'نمایشنامه و آثار تئاتر',
    color: '#EC4899'
  },
  {
    name: 'تاریخ',
    slug: 'history',
    type: TagType.ThematicCategory,
    description: 'کتاب‌های تاریخی',
    color: '#92400E'
  },
  {
    name: 'سیاست',
    slug: 'politics',
    type: TagType.ThematicCategory,
    description: 'آثار سیاسی و حکومت',
    color: '#DC2626'
  },
  {
    name: 'بیوگرافی',
    slug: 'biography',
    type: TagType.ThematicCategory,
    description: 'زندگینامه شخصیت‌ها',
    color: '#059669'
  },
  {
    name: 'علم و فناوری',
    slug: 'science-technology',
    type: TagType.ThematicCategory,
    description: 'کتاب‌های علمی و فناوری',
    color: '#0EA5E9'
  },

  // Story Type
  {
    name: 'عاشقانه',
    slug: 'romance',
    type: TagType.StoryType,
    description: 'داستان‌های عاشقانه',
    color: '#F43F5E'
  },
  {
    name: 'فلسفی',
    slug: 'philosophical',
    type: TagType.StoryType,
    description: 'داستان‌های با مضامین فلسفی',
    color: '#8B5CF6'
  },
  {
    name: 'تاریخی',
    slug: 'historical',
    type: TagType.StoryType,
    description: 'داستان‌های تاریخی',
    color: '#92400E'
  },
  {
    name: 'فانتزی',
    slug: 'fantasy',
    type: TagType.StoryType,
    description: 'داستان‌های فانتزی و جادویی',
    color: '#7C3AED'
  },
  {
    name: 'معمایی',
    slug: 'mystery',
    type: TagType.StoryType,
    description: 'داستان‌های معمایی و راز آلود',
    color: '#374151'
  },
  {
    name: 'جنایی',
    slug: 'crime',
    type: TagType.StoryType,
    description: 'داستان‌های جنایی و پلیسی',
    color: '#1F2937'
  },
  {
    name: 'علمی تخیلی',
    slug: 'science-fiction',
    type: TagType.StoryType,
    description: 'داستان‌های علمی تخیلی',
    color: '#0891B2'
  },
  {
    name: 'روانشناختی',
    slug: 'psychological',
    type: TagType.StoryType,
    description: 'داستان‌های روانشناختی',
    color: '#BE185D'
  },
  {
    name: 'ترسناک',
    slug: 'horror',
    type: TagType.StoryType,
    description: 'داستان‌های ترسناک و وحشت',
    color: '#991B1B'
  },
  {
    name: 'ماجراجویی',
    slug: 'adventure',
    type: TagType.StoryType,
    description: 'داستان‌های ماجراجویی',
    color: '#059669'
  },

  // Featured Books
  {
    name: '۱۰۰۱ رمان',
    slug: '1001-novels',
    type: TagType.FeaturedBooks,
    description: 'کتاب‌های منتخب ۱۰۰۱ رمان',
    color: '#DC2626'
  },
  {
    name: 'پرفروش‌های نیویورک تایمز',
    slug: 'ny-times-bestsellers',
    type: TagType.FeaturedBooks,
    description: 'کتاب‌های پرفروش نیویورک تایمز',
    color: '#1D4ED8'
  },
  {
    name: 'بهترین‌های توسعه فردی',
    slug: 'best-self-development',
    type: TagType.FeaturedBooks,
    description: 'بهترین کتاب‌های توسعه فردی',
    color: '#16A34A'
  },
  {
    name: '۱۰۰ کتاب لوموند',
    slug: 'le-monde-100-books',
    type: TagType.FeaturedBooks,
    description: 'صد کتاب برتر لوموند',
    color: '#7C2D12'
  },
  {
    name: 'برترین‌های گاردین',
    slug: 'guardian-best',
    type: TagType.FeaturedBooks,
    description: 'کتاب‌های برتر گاردین',
    color: '#0F766E'
  },
  {
    name: 'باشگاه کتاب اپرا',
    slug: 'oprah-book-club',
    type: TagType.FeaturedBooks,
    description: 'کتاب‌های منتخب باشگاه کتاب اپرا',
    color: '#7C2D12'
  },

  // Literature Award
  {
    name: 'نوبل ادبیات',
    slug: 'nobel-literature',
    type: TagType.LiteratureAward,
    description: 'برندگان جایزه نوبل ادبیات',
    color: '#FBBF24'
  },
  {
    name: 'جایزه بوکر',
    slug: 'man-booker',
    type: TagType.LiteratureAward,
    description: 'برندگان جایزه بوکر',
    color: '#F59E0B'
  },
  {
    name: 'پولیتزر ادبیات',
    slug: 'pulitzer-fiction',
    type: TagType.LiteratureAward,
    description: 'برندگان جایزه پولیتزر ادبیات',
    color: '#D97706'
  },
  {
    name: 'گنکور',
    slug: 'goncourt-prize',
    type: TagType.LiteratureAward,
    description: 'برندگان جایزه گنکور',
    color: '#B45309'
  },
  {
    name: 'هوگو',
    slug: 'hugo-award',
    type: TagType.LiteratureAward,
    description: 'برندگان جایزه هوگو',
    color: '#92400E'
  },
  {
    name: 'ادگار',
    slug: 'edgar-award',
    type: TagType.LiteratureAward,
    description: 'برندگان جایزه ادگار',
    color: '#78350F'
  },

  // Nation Literature
  {
    name: 'ادبیات ایرانی',
    slug: 'iranian-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات ایرانی',
    color: '#059669'
  },
  {
    name: 'ادبیات آمریکایی',
    slug: 'american-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات آمریکا',
    color: '#DC2626'
  },
  {
    name: 'ادبیات فرانسوی',
    slug: 'french-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات فرانسه',
    color: '#2563EB'
  },
  {
    name: 'ادبیات ژاپنی',
    slug: 'japanese-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات ژاپن',
    color: '#DC2626'
  },
  {
    name: 'ادبیات روسی',
    slug: 'russian-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات روسیه',
    color: '#1D4ED8'
  },
  {
    name: 'ادبیات آلمانی',
    slug: 'german-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات آلمان',
    color: '#991B1B'
  },
  {
    name: 'ادبیات انگلیسی',
    slug: 'english-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات انگلیس',
    color: '#1E40AF'
  },
  {
    name: 'ادبیات کانادایی',
    slug: 'canadian-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات کانادا',
    color: '#DC2626'
  },
  {
    name: 'ادبیات چینی',
    slug: 'chinese-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات چین',
    color: '#DC2626'
  },
  {
    name: 'ادبیات لاتین آمریکا',
    slug: 'latin-american-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات آمریکای لاتین',
    color: '#059669'
  },

  // System Tags
  {
    name: 'حراج جشنواره',
    slug: 'festival-sales',
    type: TagType.SystemTags,
    description: 'کتاب‌های در حراج جشنواره',
    color: '#DC2626'
  },
  {
    name: 'کتاب‌های پیشنهادی',
    slug: 'recommended-books',
    type: TagType.SystemTags,
    description: 'کتاب‌های پیشنهادی سردبیر',
    color: '#16A34A'
  },
  {
    name: 'پرفروش‌ها',
    slug: 'bestsellers',
    type: TagType.SystemTags,
    description: 'کتاب‌های پرفروش',
    color: '#FBBF24'
  },
  {
    name: 'تازه منتشر شده',
    slug: 'new-releases',
    type: TagType.SystemTags,
    description: 'کتاب‌های تازه منتشر شده',
    color: '#3B82F6'
  },
  {
    name: 'نسخه امضا شده',
    slug: 'signed-editions',
    type: TagType.SystemTags,
    description: 'نسخه‌های امضا شده نویسنده',
    color: '#7C3AED'
  },
  {
    name: 'انتخاب کارکنان',
    slug: 'staff-picks',
    type: TagType.SystemTags,
    description: 'انتخاب کارکنان فروشگاه',
    color: '#059669'
  },
  {
    name: 'ویرایش محدود',
    slug: 'limited-edition',
    type: TagType.SystemTags,
    description: 'نسخه‌های ویرایش محدود',
    color: '#BE185D'
  },

  // Collection
  {
    name: 'ماجراهای تن تن',
    slug: 'adventures-of-tintin',
    type: TagType.Collection,
    description: 'مجموعه کمیک‌های تن تن',
    color: '#0891B2'
  },
  {
    name: 'ارباب حلقه‌ها',
    slug: 'lord-of-the-rings',
    type: TagType.Collection,
    description: 'مجموعه ارباب حلقه‌ها',
    color: '#92400E'
  },
  {
    name: 'هری پاتر',
    slug: 'harry-potter',
    type: TagType.Collection,
    description: 'مجموعه هری پاتر',
    color: '#7C2D12'
  },
  {
    name: 'شرلوک هولمز',
    slug: 'sherlock-holmes',
    type: TagType.Collection,
    description: 'مجموعه داستان‌های شرلوک هولمز',
    color: '#374151'
  },
  {
    name: 'آگاتا کریستی',
    slug: 'agatha-christie',
    type: TagType.Collection,
    description: 'مجموعه آثار آگاتا کریستی',
    color: '#1F2937'
  },

  // Age Group
  {
    name: 'نوجوانان',
    slug: 'teenagers',
    type: TagType.AgeGroup,
    description: 'کتاب‌های مناسب نوجوانان',
    color: '#F59E0B'
  },
  {
    name: 'جوانان',
    slug: 'young-adults',
    type: TagType.AgeGroup,
    description: 'کتاب‌های مناسب جوانان',
    color: '#3B82F6'
  },
  {
    name: 'کودکان',
    slug: 'children',
    type: TagType.AgeGroup,
    description: 'کتاب‌های کودکان',
    color: '#10B981'
  },
  {
    name: 'بزرگسالان',
    slug: 'adults',
    type: TagType.AgeGroup,
    description: 'کتاب‌های بزرگسالان',
    color: '#6B7280'
  },
  {
    name: 'خردسالان',
    slug: 'early-readers',
    type: TagType.AgeGroup,
    description: 'کتاب‌های خردسالان',
    color: '#EC4899'
  },

  // Mood Theme
  {
    name: 'الهام‌بخش',
    slug: 'inspirational',
    type: TagType.MoodTheme,
    description: 'کتاب‌های انگیزشی و الهام‌بخش',
    color: '#FBBF24'
  },
  {
    name: 'طنزآمیز',
    slug: 'humorous',
    type: TagType.MoodTheme,
    description: 'کتاب‌های طنز و کمدی',
    color: '#F59E0B'
  },
  {
    name: 'تاریک',
    slug: 'dark',
    type: TagType.MoodTheme,
    description: 'کتاب‌های با فضای تاریک',
    color: '#374151'
  },
  {
    name: 'دل‌انگیز',
    slug: 'heartwarming',
    type: TagType.MoodTheme,
    description: 'کتاب‌های دل‌انگیز و احساسی',
    color: '#F43F5E'
  },
  {
    name: 'هیجان‌انگیز',
    slug: 'suspenseful',
    type: TagType.MoodTheme,
    description: 'کتاب‌های پرهیجان',
    color: '#DC2626'
  },
  {
    name: 'آرامش‌بخش',
    slug: 'relaxing',
    type: TagType.MoodTheme,
    description: 'کتاب‌های آرامش‌بخش',
    color: '#059669'
  },
  {
    name: 'تفکربرانگیز',
    slug: 'thought-provoking',
    type: TagType.MoodTheme,
    description: 'کتاب‌های تفکربرانگیز',
    color: '#7C3AED'
  },

  // Time Period
  {
    name: 'دوران باستان',
    slug: 'ancient-times',
    type: TagType.TimePeriod,
    description: 'داستان‌های دوران باستان',
    color: '#92400E'
  },
  {
    name: 'قرون وسطی',
    slug: 'medieval',
    type: TagType.TimePeriod,
    description: 'داستان‌های قرون وسطی',
    color: '#78350F'
  },
  {
    name: 'قرن نوزدهم',
    slug: '19th-century',
    type: TagType.TimePeriod,
    description: 'داستان‌های قرن نوزدهم',
    color: '#B45309'
  },
  {
    name: 'معاصر',
    slug: 'contemporary',
    type: TagType.TimePeriod,
    description: 'داستان‌های معاصر',
    color: '#059669'
  },
  {
    name: 'آینده نزدیک',
    slug: 'near-future',
    type: TagType.TimePeriod,
    description: 'داستان‌های آینده نزدیک',
    color: '#0891B2'
  },
  {
    name: 'آینده دور',
    slug: 'far-future',
    type: TagType.TimePeriod,
    description: 'داستان‌های آینده دور',
    color: '#1D4ED8'
  },

  // Content Warnings
  {
    name: 'خشونت',
    slug: 'violence',
    type: TagType.ContentWarnings,
    description: 'محتوای خشونت‌آمیز',
    color: '#DC2626'
  },
  {
    name: 'محتوای جنسی',
    slug: 'sexual-content',
    type: TagType.ContentWarnings,
    description: 'محتوای جنسی بزرگسالان',
    color: '#BE185D'
  },
  {
    name: 'زبان رکیک',
    slug: 'strong-language',
    type: TagType.ContentWarnings,
    description: 'استفاده از زبان رکیک',
    color: '#991B1B'
  },
  {
    name: 'سوءاستفاده از مواد',
    slug: 'substance-abuse',
    type: TagType.ContentWarnings,
    description: 'محتوای مربوط به مصرف مواد',
    color: '#7C2D12'
  },
  {
    name: 'مسائل سلامت روان',
    slug: 'mental-health-issues',
    type: TagType.ContentWarnings,
    description: 'محتوای مربوط به سلامت روان',
    color: '#7C3AED'
  },
  {
    name: 'تراما',
    slug: 'trauma',
    type: TagType.ContentWarnings,
    description: 'محتوای آسیب‌زننده روحی',
    color: '#374151'
  },

  // Difficulty Level
  {
    name: 'آسان',
    slug: 'easy-read',
    type: TagType.DifficultyLevel,
    description: 'کتاب‌های با خواندن آسان',
    color: '#10B981'
  },
  {
    name: 'متوسط',
    slug: 'intermediate',
    type: TagType.DifficultyLevel,
    description: 'کتاب‌های با سطح متوسط',
    color: '#F59E0B'
  },
  {
    name: 'دشوار',
    slug: 'challenging',
    type: TagType.DifficultyLevel,
    description: 'کتاب‌های چالش‌برانگیز',
    color: '#DC2626'
  },
  {
    name: 'آکادمیک',
    slug: 'academic',
    type: TagType.DifficultyLevel,
    description: 'کتاب‌های آکادمیک و علمی',
    color: '#1D4ED8'
  },
  {
    name: 'خواندن سریع',
    slug: 'quick-read',
    type: TagType.DifficultyLevel,
    description: 'کتاب‌های برای خواندن سریع',
    color: '#059669'
  },
  // Additional Thematic Category
  {
    name: 'شعر',
    slug: 'poetry',
    type: TagType.ThematicCategory,
    description: 'مجموعه‌های شعر و ادبیات شاعرانه',
    color: '#6D28D9'
  },
  {
    name: 'مذهبی',
    slug: 'religious',
    type: TagType.ThematicCategory,
    description: 'کتاب‌های مذهبی و معنوی',
    color: '#047857'
  },
  {
    name: 'علوم اجتماعی',
    slug: 'social-sciences',
    type: TagType.ThematicCategory,
    description: 'کتاب‌های علوم اجتماعی و جامعه‌شناسی',
    color: '#4B5563'
  },

  // Additional Story Type
  {
    name: 'دیستوپیایی',
    slug: 'dystopian',
    type: TagType.StoryType,
    description: 'داستان‌های دیستوپیایی و آخرالزمانی',
    color: '#4B5563'
  },
  {
    name: 'طنز اجتماعی',
    slug: 'social-satire',
    type: TagType.StoryType,
    description: 'داستان‌های طنز با موضوعات اجتماعی',
    color: '#EA580C'
  },
  {
    name: 'مذهبی داستانی',
    slug: 'religious-fiction',
    type: TagType.StoryType,
    description: 'داستان‌های با مضامین مذهبی',
    color: '#065F46'
  },

  // Additional Featured Books
  {
    name: 'کتاب‌های منتخب گودریدز',
    slug: 'goodreads-choice',
    type: TagType.FeaturedBooks,
    description: 'کتاب‌های برگزیده جوایز گودریدز',
    color: '#2563EB'
  },
  {
    name: 'کلاسیک‌های مدرن',
    slug: 'modern-classics',
    type: TagType.FeaturedBooks,
    description: 'آثار کلاسیک مدرن',
    color: '#7C2D12'
  },

  // Additional Literature Award
  {
    name: 'جایزه ملی کتاب',
    slug: 'national-book-award',
    type: TagType.LiteratureAward,
    description: 'برندگان جایزه ملی کتاب آمریکا',
    color: '#B91C1C'
  },
  {
    name: 'جایزه پن/فالکنر',
    slug: 'pen-faulkner',
    type: TagType.LiteratureAward,
    description: 'برندگان جایزه پن/فالکنر',
    color: '#92400E'
  },

  // Additional Nation Literature
  {
    name: 'ادبیات هندی',
    slug: 'indian-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات هند',
    color: '#EA580C'
  },
  {
    name: 'ادبیات آفریقایی',
    slug: 'african-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات آفریقا',
    color: '#047857'
  },
  {
    name: 'ادبیات ایتالیایی',
    slug: 'italian-literature',
    type: TagType.NationLiterature,
    description: 'آثار ادبیات ایتالیا',
    color: '#16A34A'
  },

  // Additional System Tags
  {
    name: 'کتاب‌های صوتی',
    slug: 'audiobooks',
    type: TagType.SystemTags,
    description: 'کتاب‌های صوتی قابل دانلود',
    color: '#8B5CF6'
  },
  {
    name: 'پیش‌فروش',
    slug: 'pre-order',
    type: TagType.SystemTags,
    description: 'کتاب‌های در مرحله پیش‌فروش',
    color: '#D97706'
  },

  // Additional Collection
  {
    name: 'نغمه یخ و آتش',
    slug: 'game-of-thrones',
    type: TagType.Collection,
    description: 'مجموعه نغمه یخ و آتش',
    color: '#1F2937'
  },
  {
    name: 'داستان‌های مارول',
    slug: 'marvel-comics',
    type: TagType.Collection,
    description: 'مجموعه کمیک‌های مارول',
    color: '#DC2626'
  },

  // Additional Age Group
  {
    name: 'نونهالان',
    slug: 'toddlers',
    type: TagType.AgeGroup,
    description: 'کتاب‌های مناسب نونهالان',
    color: '#F472B6'
  },

  // Additional Mood Theme
  {
    name: 'عاشقانه غم‌انگیز',
    slug: 'tragic-romance',
    type: TagType.MoodTheme,
    description: 'داستان‌های عاشقانه غم‌انگیز',
    color: '#9F1239'
  },
  {
    name: 'ماجراجویانه',
    slug: 'adventurous',
    type: TagType.MoodTheme,
    description: 'کتاب‌های با حس ماجراجویی',
    color: '#059669'
  },

  // Additional Time Period
  {
    name: 'رنسانس',
    slug: 'renaissance',
    type: TagType.TimePeriod,
    description: 'داستان‌های دوره رنسانس',
    color: '#7C2D12'
  },
  {
    name: 'قرن بیستم',
    slug: '20th-century',
    type: TagType.TimePeriod,
    description: 'داستان‌های قرن بیستم',
    color: '#6B7280'
  },

  // Additional Content Warnings
  {
    name: 'مرگ و سوگ',
    slug: 'death-grief',
    type: TagType.ContentWarnings,
    description: 'محتوای مربوط به مرگ و از دست دادن',
    color: '#4B5563'
  },
  {
    name: 'تعصبات نژادی',
    slug: 'racial-prejudice',
    type: TagType.ContentWarnings,
    description: 'محتوای مرتبط با تعصبات نژادی',
    color: '#991B1B'
  },

  // Additional Difficulty Level
  {
    name: 'خیلی دشوار',
    slug: 'very-challenging',
    type: TagType.DifficultyLevel,
    description: 'کتاب‌های بسیار چالش‌برانگیز',
    color: '#B91C1C'
  },
  {
    name: 'خواندن تفننی',
    slug: 'casual-read',
    type: TagType.DifficultyLevel,
    description: 'کتاب‌های مناسب خواندن تفننی',
    color: '#10B981'
  }
];

async function seedTags() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'mysql',
    database: 'bookstore-db',
    entities: [Tag],
    synchronize: false,
  });

  console.log('🏷️  Starting tags seeding...');
  
  const tagRepository = dataSource.getRepository(Tag);
  
  try {
    await dataSource.initialize();
    console.log('📦 Database connected');

    // Safe deletion with existence check
    await safeDeleteTags(tagRepository);
    
    // Seed tags
    for (const tagData of tagsData) {
      const tag = tagRepository.create({
        name: tagData.name,
        slug: tagData.slug,
        description: tagData.description,
        type: tagData.type,
        color: tagData.color,
        isActive: true,
      });
      
      await tagRepository.save(tag);
      console.log(`✅ Created tag: ${tag.name} (${tag.slug}) - ${tag.type}`);
    }
    
    console.log('🎉 Tags seeding completed successfully!');
    console.log(`📊 Total tags created: ${tagsData.length}`);
    
    // Print summary by type
    const typeCounts = tagsData.reduce((acc, tag) => {
      acc[tag.type] = (acc[tag.type] || 0) + 1;
      return acc;
    }, {} as Record<TagType, number>);
    
    console.log('\n📈 Tags by type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} tags`);
    });
    
  } catch (error) {
    console.error('❌ Tags seeding failed:', error);
    throw error;
  }
}

async function safeDeleteTags(tagRepository: Repository<Tag>) {
  try {
    // Method 1: Use DELETE query (respects foreign keys)
    const result = await tagRepository.createQueryBuilder()
      .delete()
      .from(Tag)
      .execute();
    
    console.log(`🗑️  Deleted ${result.affected || 0} existing tags`);
    
  } catch (error) {
    // If deletion fails due to foreign key constraints
    console.log('⚠️  Cannot delete tags that are referenced by titles or blogs');
    console.log('   Consider updating/deleting related records first or use upsert instead');
    
    // Alternative: Just proceed with insert/update (upsert)
    throw new Error('Cannot clear tags table due to foreign key constraints. Use upsert instead.');
  }
}

// Alternative upsert method if deletion fails
async function upsertTags(tagRepository: Repository<Tag>) {
  console.log('🔄 Using upsert method instead...');
  
  for (const tagData of tagsData) {
    try {
      // Try to find existing tag by slug
      const existingTag = await tagRepository.findOne({
        where: { slug: tagData.slug }
      });
      
      if (existingTag) {
        // Update existing tag
        await tagRepository.update(existingTag.id, {
          name: tagData.name,
          description: tagData.description,
          type: tagData.type,
          color: tagData.color,
          isActive: true,
        });
        console.log(`🔄 Updated tag: ${tagData.name} (${tagData.slug})`);
      } else {
        // Create new tag
        const tag = tagRepository.create({
          name: tagData.name,
          slug: tagData.slug,
          description: tagData.description,
          type: tagData.type,
          color: tagData.color,
          isActive: true,
        });
        
        await tagRepository.save(tag);
        console.log(`✅ Created tag: ${tagData.name} (${tagData.slug})`);
      }
    } catch (error) {
      console.error(`❌ Error processing tag ${tagData.slug}:`, error);
    }
  }
}

// Run the seeder
seedTags()
  .then(() => {
    console.log('✨ Tags eeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Tags seeding process failed:', error);
    process.exit(0);
  });