import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { RecentView as RecentView } from './types/recent-view.type';
import { CookieNames } from './enums/cookie.names';
import { plainToInstance } from 'class-transformer';
import { RecentViewDto } from 'src/modules/users/dtos/recent-view-response.dto';

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

  getRecentViews(views: string) {
    // Validate existing views
    const parsedViews = JSON.parse(views ?? '[]') as RecentView[];
    return plainToInstance(RecentViewDto, parsedViews);
  }

  updateRecentViewsCookie(res: Response, oldViews: string, newView: RecentView) {
    try {
      const validatedViews = this.getRecentViews(oldViews);

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