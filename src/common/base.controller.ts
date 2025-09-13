import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { RecentView as RecentView } from './types/recent-view.type';
import { CookieNames } from './enums/cookie.names';
import { plainToInstance } from 'class-transformer';
import { RecentlyViewedCookieDto as RecentViewCookieDto } from 'src/modules/reviews/dtos/revent-view-response';

export class BaseController {
  private cookieMaxAge: number;
  private maxRecentViews: number;

  constructor(config: ConfigService) {
    this.cookieMaxAge = config.get<number>('COOKIE_MAX_AGE', 15 * 24 * 3600 * 1000); // 15 days
    this.maxRecentViews = config.get<number>('MAX_RECENT_VIEWS', 20);
  }

  setCookie(
    res: Response,
    name: string,
    value: string,
    maxAge = this.cookieMaxAge
  ) {
    res.cookie(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge
    });
  }

  updateRecentViewsCookie(res: Response, oldViews: string, newView: RecentView) {
    try {
      // Validate existing views
      const parsedViews = JSON.parse(oldViews || '[]') as RecentView[];
      const validatedViews = plainToInstance(RecentViewCookieDto, parsedViews);
      
      // Remove duplications
      const filteredViews = validatedViews.filter(view => 
        view.slug !== newView.slug || view.type !== newView.type
      );
      
      // Keep only the most recent entries
      const updatedViews = [...filteredViews, newView].slice(-this.maxRecentViews);
      
      this.setCookie(res, CookieNames.RecentViews, JSON.stringify(updatedViews));
      
    } catch (error) {
      // Fall back to just the new view
      this.setCookie(res, CookieNames.RecentViews, JSON.stringify([newView]));
    }
  }
}