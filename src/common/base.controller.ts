import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

export class BaseController {
  constructor(private config: ConfigService) {}

  setCookie(
    res: Response,
    name: string,
    value: string,
    maxAge = this.config.get<number>('COOKIE_MAX_AGE', 15 * 24 * 3600 * 1000), // 15 days
  ) {
    res.cookie(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge
    });
  }
}