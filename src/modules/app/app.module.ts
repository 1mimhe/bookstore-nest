import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
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
          stores: [createKeyv(config.getOrThrow<string>('REDIS_URL'))]
        };
      },
    }),
    UsersModule,
    AuthorsModule,
    PublishersModule,
    BooksModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  constructor(
    private readonly config: ConfigService
  ) {}

  async configure(consumer: MiddlewareConsumer) {
    const redisClient = await createClient({
      url: this.config.getOrThrow<string>('REDIS_URL')
    }).connect();

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
}
