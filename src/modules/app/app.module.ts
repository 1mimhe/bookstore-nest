import { MiddlewareConsumer, Module, OnApplicationShutdown, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import * as session from 'express-session';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { UsersModule } from '../users/users.module';
import * as cookieParser from 'cookie-parser';
import { CookieNames } from 'src/common/enums/cookie.names';
import { AuthorsModule } from '../authors/authors.module';
import { PublishersModule } from '../publishers/publishers.module';
import { BooksModule } from '../books/books.module';
import { AuthModule } from '../auth/auth.module';
import { TagsModule } from '../tags/tags.module';
import { LanguagesModule } from '../languages/languages.module';
import { BlogsModule } from '../blogs/blogs.module';
import { CollectionsModule } from '../collections/collections.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { StaffModule } from '../staffs/staffs.module';
import { OrdersModule } from '../orders/orders.module';
import { DiscountCodesModule } from '../discount-codes/discount-codes.module';
import { TicketsModule } from '../tickets/tickets.module';
import { HealthModule } from '../health/health.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CommonModule } from 'src/common/common.module';
import { RequestIdMiddleware } from 'src/common/middlewares/request-id.middleware';
import Joi from 'joi';

/**
 * Fail-fast environment validation. The application refuses to boot when a
 * required variable is missing or malformed, instead of crashing later at
 * request time (e.g. on the first JWT signature).
 */
const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000,http://localhost:5173'),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  REDIS_URL: Joi.string().uri().required(),
  REDIS_VIEWS_URL: Joi.string().uri().required(),
  REDIS_SESSION_URL: Joi.string().uri().required(),

  SESSION_SECRET: Joi.string().min(16).required(),
  COOKIE_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_SECRET_KEY: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET_KEY: Joi.string().min(16).required(),

  PAYMENT_PROVIDER: Joi.string().valid('mock').default('mock'),
  PAYMENT_WEBHOOK_SECRET: Joi.string().min(16).default('dev-webhook-secret-0123456789'),

  ADMIN_USERNAME: Joi.string().required(),
  ADMIN_PASSWORD: Joi.string().min(8).required(),
  ADMIN_EMAIL: Joi.string().required(),
  ADMIN_PHONE: Joi.string().required(),

  COOKIE_MAX_AGE: Joi.number().optional(),
  CART_CACHE_TIME: Joi.number().optional(),
  MAX_RECENT_VIEWS: Joi.number().optional(),
});

@Module({
  imports: [
    CommonModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: process.env.NODE_ENV === 'test' ? 'sqlite' : 'mysql',
          host: config.get('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username: config.getOrThrow<string>('DB_USERNAME'),
          password: config.getOrThrow<string>('DB_PASSWORD'),
          database: config.getOrThrow<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: process.env.NODE_ENV !== 'production',
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          stores: [
            createKeyv(config.getOrThrow<string>('REDIS_URL')),
          ]
        };
      },
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute per IP
      },
    ]),
    UsersModule,
    AuthModule,
    AuthorsModule,
    PublishersModule,
    BooksModule,
    LanguagesModule,
    TagsModule,
    BlogsModule,
    CollectionsModule,
    ReviewsModule,
    StaffModule,
    OrdersModule,
    DiscountCodesModule,
    TicketsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnApplicationShutdown {
  private sessionRedisClient: Awaited<ReturnType<typeof createClient>> | null = null;

  constructor(
    private readonly config: ConfigService
  ) {}

  async configure(consumer: MiddlewareConsumer) {
    const redisClient = await createClient({
      url: this.config.getOrThrow<string>('REDIS_SESSION_URL')
    }).connect();
    this.sessionRedisClient = redisClient;

    // Correlation ids first so every downstream log line carries `requestId`.
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*');

    consumer
      .apply(
        session({
          name: CookieNames.SessionId,
          secret: this.config.getOrThrow<string>('SESSION_SECRET'),
          resave: false,
          saveUninitialized: false,
          store: new RedisStore({
            client: redisClient,
            prefix: 'sess'
          }),
          cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: this.config.get<number>('COOKIE_MAX_AGE', 15 * 24 * 3600 * 1000) // 15 days
          }
        }),
      ).forRoutes('*');
    
    consumer
      .apply(
        cookieParser(this.config.get<string>('COOKIE_SECRET'))
      ).forRoutes('*');
  }

  async onApplicationShutdown() {
    await this.sessionRedisClient?.quit().catch(() => undefined);
  }
}
