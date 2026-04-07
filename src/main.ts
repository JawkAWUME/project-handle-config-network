import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
     origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',   // autorise uniquement votre frontend
     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,                 // si vous utilisez cookies / authorization headers
    allowedHeaders: 'Content-Type, Accept, Authorization',
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
