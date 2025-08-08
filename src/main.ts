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
    .addTag('Author', 'Manage authors and translators (Admin/Staff: full access; All users: read-only)')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
}
bootstrap();
