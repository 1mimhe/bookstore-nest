import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { BYPASS_TRANSFORM_KEY } from '../decorators/bypass-transform.decorator';

export interface ResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  timestamp: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseEnvelope<T> | T>
{
  constructor(private reflector?: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T> | T> {
    const bypass = this.reflector?.getAllAndOverride<boolean>(
      BYPASS_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (bypass) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map((resData) => {
        // If response is already an envelope, return as-is
        if (
          resData &&
          typeof resData === 'object' &&
          'success' in resData &&
          'statusCode' in resData &&
          'data' in resData
        ) {
          return resData;
        }

        const statusCode = response.statusCode || 200;

        // Check if response contains pagination payload (e.g., { data, meta } or { items, total })
        if (
          resData &&
          typeof resData === 'object' &&
          'meta' in resData &&
          'data' in resData
        ) {
          return {
            success: true,
            statusCode,
            timestamp: new Date().toISOString(),
            data: resData.data,
            meta: resData.meta,
          };
        }

        return {
          success: true,
          statusCode,
          timestamp: new Date().toISOString(),
          data: resData !== undefined ? resData : null,
        };
      }),
    );
  }
}
