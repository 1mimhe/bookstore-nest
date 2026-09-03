import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError, TypeORMError } from 'typeorm';
import { ConflictMessages, NotFoundMessages } from '../enums/error.messages';
import { DBErrors } from '../enums/db.errors';

@Catch(TypeORMError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (process.env.NODE_ENV === 'development') {
      this.logger.error(exception.message, exception.stack);
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'A database error occurred.';
    let errorType: string = 'Internal Server Error';

    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      errorType = 'Not Found';
      message = 'Requested resource was not found.';
    } else if (exception instanceof QueryFailedError) {
      const err = exception as any;
      const code = err.code;
      const msg: string = err.message || '';

      if (code === DBErrors.Conflict || code === '1062' || msg.includes('Duplicate entry')) {
        status = HttpStatus.CONFLICT;
        errorType = 'Conflict';

        if (msg.includes('ISBN_UNIQUE') || msg.includes('isbn')) {
          message = ConflictMessages.ISBN;
        } else if (msg.includes('COLLECTION_BOOK_UNIQUE')) {
          message = ConflictMessages.CollectionBook;
        } else if (msg.includes('REVIEW_REACTION_INDEX')) {
          message = ConflictMessages.Reaction;
        } else if (msg.includes('BOOKMARK_UNIQUE')) {
          message = ConflictMessages.Bookmark;
        } else if (msg.includes('PUBLISHER_NAME_UNIQUE')) {
          message = ConflictMessages.PublisherName;
        } else if (msg.includes('NATIONAL_ID_UNIQUE')) {
          message = ConflictMessages.NationalId;
        } else if (msg.includes('TAG_NAME')) {
          message = ConflictMessages.Tag;
        } else {
          message = ConflictMessages.Slug;
        }
      } else if (code === DBErrors.ReferenceNotFound || code === '1452' || msg.includes('foreign key constraint fails')) {
        status = HttpStatus.NOT_FOUND;
        errorType = 'Not Found';

        if (msg.includes('titleId')) {
          message = NotFoundMessages.Title;
        } else if (msg.includes('authorId')) {
          message = NotFoundMessages.Author;
        } else if (msg.includes('publisherId')) {
          message = NotFoundMessages.Publisher;
        } else if (msg.includes('bookId')) {
          message = NotFoundMessages.Book;
        } else if (msg.includes('parentReviewId')) {
          message = NotFoundMessages.ParentReview;
        } else if (msg.includes('staffId')) {
          message = NotFoundMessages.Staff;
        } else {
          message = 'Referenced entity was not found.';
        }
      }
    }

    response.status(status).json({
      statusCode: status,
      error: errorType,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
