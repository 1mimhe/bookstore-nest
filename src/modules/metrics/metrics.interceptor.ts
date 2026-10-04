import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

/**
 * Records every handled request (method, controller + handler route, status,
 * latency) into `MetricsService`. The `/metrics` scrape endpoint itself is
 * excluded so monitoring does not observe itself.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const controller = context.getClass().name;
    if (controller === 'MetricsController') {
      return next.handle();
    }

    const startedAt = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<{ method: string }>();
    const response = http.getResponse<Response>();
    const route = `${controller}.${context.getHandler().name}`;
    let status = 500;

    return next.handle().pipe(
      tap({
        next: () => {
          status = response.statusCode || 200;
        },
        error: (error: { getStatus?: () => number; status?: number }) => {
          status =
            typeof error?.getStatus === 'function'
              ? error.getStatus()
              : error?.status ?? 500;
        },
      }),
      finalize(() => {
        this.metrics.record(request.method, route, status, Date.now() - startedAt);
      }),
    );
  }
}
