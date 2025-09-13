export enum RecentViewTypes {
  Title = 'title',
  Author = 'author',
  Publisher = 'publisher',
  Blog = 'blog',
  Character = 'character'
}

export interface RecentView {
  type: RecentViewTypes;
  slug: string;
}