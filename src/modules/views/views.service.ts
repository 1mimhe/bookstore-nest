import { Inject, Injectable } from '@nestjs/common';
import { TrendingPeriod, ViewEntityTypes, ViewResult } from './views.types';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CookieNames } from 'src/common/enums/cookie.names';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../app/redis.module';
import { Cron } from '@nestjs/schedule';
import { Collection, DataSource } from 'typeorm';
import { Title } from '../books/entities/title.entity';
import { Author } from '../authors/author.entity';
import { Publisher } from '../publishers/publisher.entity';
import { Blog } from '../blogs/blog.entity';
import { Tag } from '../tags/entities/tag.entity';

@Injectable()
export class ViewsService {
  private cookieMaxAge: number;

  constructor(
    @Inject(REDIS_CLIENT) private redisClient: Redis,
    private dataSource: DataSource,
    config: ConfigService,
  ) {
    this.cookieMaxAge = config.get<number>('COOKIE_MAX_AGE', 15 * 24 * 3600 * 100);
  }

  async recordView(
    entityType: ViewEntityTypes,
    entityId: string,
    req: Request,
    res: Response,
    userId?: string,
  ): Promise<ViewResult> {
    const viewerId = this.getOrCreateViewerId(req, res, userId);
    const compositeId = `${entityType}:${entityId}`;

    // Check for duplicate views
    const viewKey = `view:${compositeId}:${viewerId}`;
    const hasViewed = await this.redisClient.exists(viewKey);

    if (hasViewed) {
      return {
        counted: false
      };
    }

    // Record the view
    const expirationSeconds = 24 * 60 * 60; // for 24 hours
    await this.redisClient.setex(viewKey, expirationSeconds, '1');

    // Increment counters
    await this.incrementCounters(entityType, entityId);

    return {
      counted: true
    };
  }

  // Cron job: Sync Redis data (pending) to database every 2 hours
  @Cron('0 */2 * * *')
  async syncToDatabase(): Promise<void> {
    console.log('Starting Entity Views Redis to Database sync...');

    const pendingKeys = await this.redisClient.keys('pending:*:views');

    if (pendingKeys.length === 0) {
      console.log(`Synced 0 entity.`);
      return;
    }

    const entityUpdates = new Map<string, number>();
    for (const key of pendingKeys) {
      const match = key.match(/pending:([^:]+:[^:]+):views/);
      if (match) {
        const compositeId = match[1];
        const views = Number(await this.redisClient.get(key) ?? 0);
        entityUpdates.set(compositeId, views);
      }
    }

    // Batch update database
    for (const [compositeId, data] of entityUpdates) {
      await this.incrementEntityViews(compositeId, data);
    }

    // Clear pending
    await this.redisClient.del(pendingKeys);

    console.log(`Synced ${entityUpdates.size} entities.`);
  }

  async getTrendingEntities(
    entityType: ViewEntityTypes,
    period: TrendingPeriod = TrendingPeriod.Week,
    limit: number = 20
  ): Promise<Array<{ entityId: string; views: number }>> {
    const cacheKey = `trending:${entityType}:${period}`;
    const cached = await this.redisClient.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Get trending views based on daily views
    const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const results = await this.calculateTrending(entityType, periodDays, limit);

    // Cache trending for appropriate time
    const cacheTime = period === 'day' ? 1800 : period === 'week' ? 7200 : 172_800;
    await this.redisClient.setex(cacheKey, cacheTime, JSON.stringify(results));
    
    return results;
  }

  private async incrementCounters(
    entityType: ViewEntityTypes,
    entityId: string,
  ): Promise<void> {
    const compositeId = `${entityType}:${entityId}`;
    const pipeline = this.redisClient.pipeline();

    // Increment pending view count
    pipeline.incr(`pending:${compositeId}:views`);

    // Add to daily views (for trending)
    const today = this.getTodayKey();
    pipeline.incr(`daily:${compositeId}:${today}`);
    pipeline.expire(`daily:${compositeId}:${today}`, 30 * 24 * 60 * 60); // 30 days

    await pipeline.exec();
  }

  private async calculateTrending(
    entityType: ViewEntityTypes,
    days: number,
    limit: number
  ): Promise<Array<{ entityId: string; views: number }>> {
    const pattern = `daily:${entityType}:*`;
    const keys = await this.redisClient.keys(pattern);
    
    const entityViews = new Map<string, number>();

    // Filter keys by date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateString = startDate.toISOString().split('T')[0];
    
    for (const key of keys) {
      const match = key.match(/daily:([^:]+):([^:]+):(\d{4}-\d{2}-\d{2})/);
      if (match && match[3] >= startDateString) {
        const entityId = match[2];
        const views = Number(await this.redisClient.get(key) ?? 0);
        
        // Sum views
        const current = entityViews.get(entityId) ?? 0;
        entityViews.set(entityId, current + views);
      }
    }

    return Array.from(entityViews.entries())
      .map(([entityId, views]) => ({ entityId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  private async incrementEntityViews(compositeId: string, additionalViews: number): Promise<void> {
    const MODEL_MAP = {
      [ViewEntityTypes.Title]: Title,
      [ViewEntityTypes.Author]: Author,
      [ViewEntityTypes.Publisher]: Publisher,
      [ViewEntityTypes.Blog]: Blog,
      [ViewEntityTypes.Collection]: Collection,
      [ViewEntityTypes.Tag]: Tag,
    } as const;
    const [entityType, entityId] = compositeId.split(':', 2);

    await this.dataSource
      .getRepository(MODEL_MAP[entityType])
      .increment({ id: entityId }, 'views', additionalViews);
  }

  private getOrCreateViewerId(req: Request, res: Response, userId?: string): string {
    if (userId) {
      return `user_${userId}`;
    }

    let viewerId = req.cookies?.[CookieNames.Viewer];

    if (!viewerId) {
      viewerId = `anon_${uuidv4()}`;
      res.cookie(CookieNames.Viewer, viewerId, {
        maxAge: this.cookieMaxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
    
    return viewerId;
  }

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }
}
