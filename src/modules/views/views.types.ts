
export enum ViewEntityTypes {
  Title = 'title',
  Author = 'author',
  Publisher = 'publisher',
  Blog = 'blog',
  Tag = 'tag',
  Collection = 'collection',
}

export interface ViewResult {
  counted: boolean;
}