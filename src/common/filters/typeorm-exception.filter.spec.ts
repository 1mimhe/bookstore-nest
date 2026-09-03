import { TypeOrmExceptionFilter } from './typeorm-exception.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';
import { ConflictMessages, NotFoundMessages } from '../enums/error.messages';

describe('TypeOrmExceptionFilter', () => {
  let filter: TypeOrmExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new TypeOrmExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    const mockResponse = {
      status: mockStatus,
    };
    const mockRequest = {
      url: '/test-endpoint',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('should map EntityNotFoundError to 404 NOT FOUND', () => {
    const error = new EntityNotFoundError('TargetEntity', 'criteria');
    filter.catch(error, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'Requested resource was not found.',
        path: '/test-endpoint',
      }),
    );
  });

  it('should map QueryFailedError duplicate ISBN to 409 CONFLICT', () => {
    const error = new QueryFailedError('query', [], new Error('Duplicate entry for key ISBN_UNIQUE'));
    (error as any).code = 'ER_DUP_ENTRY';

    filter.catch(error, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: ConflictMessages.ISBN,
      }),
    );
  });

  it('should map QueryFailedError duplicate slug to default ConflictMessages.Slug', () => {
    const error = new QueryFailedError('query', [], new Error('Duplicate entry'));
    (error as any).code = '1062';

    filter.catch(error, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: ConflictMessages.Slug,
      }),
    );
  });

  it('should map foreign key constraint failure for titleId to 404 NOT FOUND', () => {
    const error = new QueryFailedError('query', [], new Error('foreign key constraint fails (titleId)'));
    (error as any).code = '1452';

    filter.catch(error, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: NotFoundMessages.Title,
      }),
    );
  });

  it('should fallback to 500 for generic TypeORMError', () => {
    const error = new TypeORMError('Something went wrong in the driver');
    filter.catch(error, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'A database error occurred.',
      }),
    );
  });
});
