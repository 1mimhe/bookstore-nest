import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HeaderNames } from './common/enums/header.names';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
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
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
}
bootstrap();
