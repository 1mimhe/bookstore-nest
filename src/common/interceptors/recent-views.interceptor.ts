import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { CookieService } from '../services/cookie.service';
import { TRACK_RECENT_VIEW_KEY } from '../decorators/track-recent-view.decorator';
import { RecentViewTypes } from '../types/recent-view.type';
import { CookieNames } from '../enums/cookie.names';

@Injectable()
export class RecentViewsInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cookieService: CookieService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const viewType = this.reflector.get<RecentViewTypes>(
      TRACK_RECENT_VIEW_KEY,
      context.getHandler(),
    );

    if (!viewType) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    return next.handle().pipe(
      tap((data) => {
        const slug = req.params?.slug || data?.slug;
        if (slug) {
          const recentViewsCookie = req.cookies?.[CookieNames.RecentViews] || '';
          this.cookieService.updateRecentViewsCookie(res, recentViewsCookie, {
            type: viewType,
            slug,
          });
        }
      }),
    );
  }
}
