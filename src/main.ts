// src/main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import * as compression from "compression";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Increase body parser limits for PDF uploads
  app.use(json({ limit: "50mb" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get(
      "CORS_ORIGIN",
      "https://www.pacassetmanagement.com"
    ),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  });

  // Global prefix//
  app.setGlobalPrefix("api");

  const port = configService.get("PORT", 3001);

  await app.listen(port);

  console.log(
    `🚀 PACAM Redemption Backend running on: http://localhost:${port}`
  );
  console.log(`📧 Email service configured: ${configService.get("SMTP_HOST")}`);
  console.log(`🌐 CORS enabled for: ${configService.get("CORS_ORIGIN")}`);
}

bootstrap();
