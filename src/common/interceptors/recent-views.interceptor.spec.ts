import { RecentViewsInterceptor } from './recent-views.interceptor';
import { Reflector } from '@nestjs/core';
import { CookieService } from '../services/cookie.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { RecentViewTypes } from '../types/recent-view.type';
import { TRACK_RECENT_VIEW_KEY } from '../decorators/track-recent-view.decorator';

describe('RecentViewsInterceptor', () => {
  let interceptor: RecentViewsInterceptor;
  let reflector: jest.Mocked<Reflector>;
  let cookieService: jest.Mocked<CookieService>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as any;
    cookieService = {
      updateRecentViewsCookie: jest.fn(),
    } as any;

    interceptor = new RecentViewsInterceptor(reflector, cookieService);
  });

  it('should bypass when no TRACK_RECENT_VIEW_KEY metadata is present', (done) => {
    reflector.get.mockReturnValue(undefined);

    const context = {
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    const handler: CallHandler = {
      handle: () => of({ slug: 'test' }),
    };

    interceptor.intercept(context, handler).subscribe(() => {
      expect(cookieService.updateRecentViewsCookie).not.toHaveBeenCalled();
      done();
    });
  });

  it('should call cookieService.updateRecentViewsCookie when slug present', (done) => {
    reflector.get.mockReturnValue(RecentViewTypes.Title);

    const context = {
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          params: { slug: 'great-gatsby' },
          cookies: {},
        }),
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const handler: CallHandler = {
      handle: () => of({}),
    };

    interceptor.intercept(context, handler).subscribe(() => {
      expect(cookieService.updateRecentViewsCookie).toHaveBeenCalledWith(
        expect.any(Object),
        '',
        { type: RecentViewTypes.Title, slug: 'great-gatsby' },
      );
      done();
    });
  });
});
