import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConflictMessages, NotFoundMessages } from '../enums/error.messages';
import { DBErrors } from '../enums/db.errors';

export const dbErrorHandler = (error) => {
  if (process.env.NODE_ENV === 'development') console.error(error);

  if (error.code === DBErrors.Conflict) {
    if (error.message.includes('COLLECTION_BOOK_UNIQUE'))
      throw new ConflictException(ConflictMessages.CollectionBook);
    if (error.message.includes('REVIEW_REACTION_INDEX')) {
      throw new ConflictException(ConflictMessages.Reaction);
    }
    if (error.message.includes('BOOKMARK_UNIQUE')) {
      throw new ConflictException(ConflictMessages.Bookmark);
    }
    throw new ConflictException(ConflictMessages.Slug);
  }

  if (error.code === DBErrors.ReferenceNotFound) {
    if (error.message.includes('titleId')) {
      throw new NotFoundException(NotFoundMessages.Title);
    }
    if (error.message.includes('authorId')) {
      throw new NotFoundException(NotFoundMessages.Author);
    }
    if (error.message.includes('publisherId')) {
      throw new NotFoundException(NotFoundMessages.Publisher);
    }
    if (error.message.includes('bookId')) {
      throw new NotFoundException(NotFoundMessages.Book);
    }
    if (error.message.includes('parentReviewId')) {
      throw new NotFoundException(NotFoundMessages.ParentReview);
    }
  }

  throw error;
};