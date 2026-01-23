import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/$/, "");
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://192.168.31.94:3000',
      frontendUrl,
    ].filter(Boolean) as string[],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,   // 🔥 REQUIRED
      whitelist: true
    })
  );

  const runserver = await app.listen(process.env.PORT ?? 5000);
  console.log("server started on port", "http://localhost:" + (process.env.PORT ?? 5000));
}
bootstrap();
