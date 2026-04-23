import { config as dotenvConfig } from 'dotenv';
import "./instrument";
import { ValidationPipe, Logger, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { validateEnv } from "./config/env.validation";

// Load .env files before validation (matches EnvModule paths: .env.local → .env)
dotenvConfig({ path: '.env.local' });
dotenvConfig({ path: '.env' });

// Validate required environment variables before bootstrapping the app
validateEnv();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Request body size limits — applied before any other middleware
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ limit: '1mb', extended: true }));

  // HTTP security headers (X-Frame-Options, X-Content-Type-Options, HSTS, etc.)
  app.use(helmet());

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

  // When CORS_ORIGIN is set, ONLY those origins are allowed (no localhost fallbacks).
  // Otherwise, fall back to common local development origins.
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Institution-Id', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("ExamCraft API")
    .setDescription("The core API for the ExamCraft Examination Management System")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 API running on http://localhost:${port}/api`);
}

bootstrap();
