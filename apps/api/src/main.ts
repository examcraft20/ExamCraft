import { ValidationPipe, Logger, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");

  // API versioning — all routes default to v1
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Structured error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: [
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
    credentials: true,
  });

  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 API running on http://localhost:${port}/api`);
}

bootstrap();

