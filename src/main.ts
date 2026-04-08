import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    bufferLogs: true,
  });

  app.setGlobalPrefix('');
  app.enableCors({
     origin: ['https://network-manager-ui.vercel.app','http://localhost:4200'],   // autorise uniquement votre frontend
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,                 // si vous utilisez cookies / authorization headers
    allowedHeaders: 'Content-Type, Accept, Authorization',
  })

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
