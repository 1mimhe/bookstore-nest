
export enum ViewEntityTypes {
  Title = 'title',
  Author = 'author',
  Publisher = 'publisher',
  Blog = 'blog',
  Tag = 'tag',
  Collection = 'collection',
}

export enum TrendingPeriod {
  Day = 'day',
  Week = 'week',
  Month = 'month'
}

export interface ViewResult {
  counted: boolean;
}