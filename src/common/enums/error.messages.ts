export enum AuthMessages {
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
  Tag = 'Tag already exists.'
}

export enum NotFoundMessages {
  Author = 'Author not found.',
  SomeAuthors = 'Some authors not found.',
  SomeTranslators = 'Some translators not found.',
  Publisher = 'Publisher not found.',
  Title = 'Title not found.',
  Book = 'Book not found.',
  Language = 'Language not found.',
  BookImage = 'Book image not found.',
  Tag = 'Tag not found.'
}