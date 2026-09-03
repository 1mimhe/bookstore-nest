import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { RecentView } from '../types/recent-view.type';
import { CookieNames } from '../enums/cookie.names';
import { plainToInstance } from 'class-transformer';
import { RecentViewDto } from '../../modules/users/dtos/recent-view-response.dto';

@Injectable()
export class CookieService {
  private readonly cookieMaxAge: number;
  private readonly maxRecentViews: number;

  constructor(config: ConfigService) {
    this.cookieMaxAge = config.get<number>('COOKIE_MAX_AGE', 15 * 24 * 3600 * 1000); // 15 days
    this.maxRecentViews = config.get<number>('MAX_RECENT_VIEWS', 20);
  }

  setCookie(
    res: Response,
    name: string,
    value: string,
    maxAge = this.cookieMaxAge,
  ) {
    res.cookie(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
    });
  }

  getRecentViews(views: string): RecentViewDto[] {
    try {
      const parsedViews = JSON.parse(views ?? '[]') as RecentView[];
      return plainToInstance(RecentViewDto, parsedViews);
    } catch {
      return [];
    }
  }

  updateRecentViewsCookie(res: Response, oldViews: string, newView: RecentView) {
    try {
      const validatedViews = this.getRecentViews(oldViews);

      // Remove duplicates
      const filteredViews = validatedViews.filter(
        (view) => view.slug !== newView.slug || view.type !== newView.type,
      );

      // Keep only the most recent entries
      const updatedViews = [...filteredViews, newView].slice(-this.maxRecentViews);

      this.setCookie(res, CookieNames.RecentViews, JSON.stringify(updatedViews));
    } catch {
      this.setCookie(res, CookieNames.RecentViews, JSON.stringify([newView]));
    }
  }
}
