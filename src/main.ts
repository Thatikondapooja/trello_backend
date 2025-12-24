import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const runserver=await app.listen(process.env.PORT ?? 3000);
  console.log("server started on port", "http://localhost:"+ (process.env.PORT ?? 3000) );
}
bootstrap();
