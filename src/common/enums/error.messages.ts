export enum AuthMessages {
  Unauthorized = 'User is unauthorized.',
  InvalidCredentials = 'Invalid credentials.',
  AlreadyAuthorized = 'User is already authorized. Logout first or refresh token.',
  MissingAccessToken = 'Access token is required but was not provided. Please include a valid access token in the request headers.',
  AccessDenied = 'Access Denied. You do not have the required permissions to perform this action.',
  InvalidAccessToken = 'Invalid access token. Please refresh it.',
  InvalidRefreshToken = 'Invalid refresh token. Please sign in again.'
}

export enum ConflictMessages {
  AlreadyExists = 'An entity with some of your credentials already exists.',
  Slug = 'Slug already exists.',
  PublisherName = 'PublisherName already exists.',
  Language = 'Language already exists.',
  ISBN = 'ISBN already exists.',
  Tag = 'Tag or its slug already exists.',
  CollectionBook = 'This book already exists at this collection.',
  Reaction = 'You already react to this review.',
  Bookmark = 'This bookmark is already exists.'
}

export enum NotFoundMessages {
  User = 'User not found.',
  Author = 'Author not found.',
  SomeAuthors = 'Some authors not found.',
  SomeTranslators = 'Some translators not found.',
  Publisher = 'Publisher not found.',
  Title = 'Title not found.',
  Book = 'Book not found.',
  Language = 'Language not found.',
  BookImage = 'Book image not found.',
  Tag = 'Tag not found.',
  Blog = 'Blog not found.',
  Address = 'Address not found.',
  Character = 'Character not found.',
  Collection = 'Collection not found.',
  CollectionBook = 'CollectionBook not found.',
  SomeCollectionBooks = 'Some collection book ids are not found within the category.',
  ParentReview = 'Parent review not found.',
  Review = 'Review not found.'
}