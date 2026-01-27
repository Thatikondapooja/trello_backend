import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/$/, "");
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3001',
        'http://192.168.31.94:3001',
        frontendUrl,
      ];
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
