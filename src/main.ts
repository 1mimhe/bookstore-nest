import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HeaderNames } from './common/enums/header.names';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { Reflector } from '@nestjs/core';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Security Headers via Helmet
  app.use(helmet());

  // Global Exception Filters
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  // Global Response Envelope Interceptor
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bookstore App')
    .setDescription('Bookstore App API using NestJS and TypeOrm')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: HeaderNames.Auth,
      description: 'Enter JWT access token',
      in: 'header',
    })
    .addTag('Auth', 'Authentication operations')
    .addTag('User', 'User profile management (For authorized users)')
    .addTag('Author', 'Manage authors and translators (Admin/Staff: full access; All users: read-only)')
    .addTag('Publisher', 'Publisher management (Admin: signup; Publishers: full access (except signup); All users: read-only)')
    .addTag('Book', 'Book, title, and character management (Admin/Staff: alternative access; All users: read-only)')
    .addTag('Language', 'Language management (For Admin)')
    .addTag('Tag', 'Tag management (Admin, Content Manager: full access; All users: read-only)')
    .addTag('Blog', 'Blog management (Admin, Content Manager: full access; Publisher: create blog; All users: read-only)')
    .addTag('Collection', 'Collection management (Admin, Content Manager: full access; All users: read-only)')
    .addTag('Review', 'Review and reaction management (Authorized users: full access; All users: read-only without *userReaction* property)')
    .addTag('Staff', 'Staff management (Admin: signup; Staff: other operations)')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documentFactory);

  // Sanitized CORS configuration
  const allowedOrigins = config.get<string>('ALLOWED_ORIGINS')?.split(',') ?? [
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  });

  const PORT = config.get<number>('PORT', 3000);
  await app.listen(PORT, () => logger.log(`Application listening on port ${PORT}`));
}
bootstrap();
