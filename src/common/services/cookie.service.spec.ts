import { CookieService } from './cookie.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CookieNames } from '../enums/cookie.names';
import { RecentViewTypes } from '../types/recent-view.type';

describe('CookieService', () => {
  let service: CookieService;
  let config: jest.Mocked<ConfigService>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    config = {
      get: jest.fn().mockImplementation((key: string, defaultValue: any) => {
        if (key === 'COOKIE_MAX_AGE') return 1296000000;
        if (key === 'MAX_RECENT_VIEWS') return 3;
        return defaultValue;
      }),
    } as any;

    mockRes = {
      cookie: jest.fn(),
    };

    service = new CookieService(config);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setCookie', () => {
    it('should set cookie on express response', () => {
      service.setCookie(mockRes as Response, 'test_name', 'test_val', 5000);
      expect(mockRes.cookie).toHaveBeenCalledWith('test_name', 'test_val', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 5000,
      });
    });
  });

  describe('getRecentViews', () => {
    it('should parse valid JSON views', () => {
      const input = JSON.stringify([{ slug: 'book-1', type: RecentViewTypes.Title }]);
      const result = service.getRecentViews(input);
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('book-1');
    });

    it('should return empty array for malformed JSON', () => {
      const result = service.getRecentViews('invalid-json');
      expect(result).toEqual([]);
    });

    it('should handle undefined or null input', () => {
      const result = service.getRecentViews(null as any);
      expect(result).toEqual([]);
    });
  });

  describe('updateRecentViewsCookie', () => {
    it('should append new view and remove duplicates', () => {
      const oldViews = JSON.stringify([
        { slug: 'item-1', type: RecentViewTypes.Title },
        { slug: 'item-2', type: RecentViewTypes.Title },
      ]);
      const newView = { slug: 'item-1', type: RecentViewTypes.Title };

      service.updateRecentViewsCookie(mockRes as Response, oldViews, newView);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        CookieNames.RecentViews,
        expect.stringContaining('item-1'),
        expect.any(Object),
      );
    });

    it('should enforce max limit by discarding oldest', () => {
      const oldViews = JSON.stringify([
        { slug: 'item-1', type: RecentViewTypes.Title },
        { slug: 'item-2', type: RecentViewTypes.Title },
        { slug: 'item-3', type: RecentViewTypes.Title },
      ]);
      const newView = { slug: 'item-4', type: RecentViewTypes.Title };

      service.updateRecentViewsCookie(mockRes as Response, oldViews, newView);

      const calledWithVal = (mockRes.cookie as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(calledWithVal);
      expect(parsed).toHaveLength(3);
      expect(parsed[parsed.length - 1].slug).toBe('item-4');
    });
  });
});
