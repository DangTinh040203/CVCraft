import {
  BadRequestException,
  type INestApplication,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { type Request } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppModule } from '@/app/app.module';
import { SocketIoAdapter } from '@/libs/adapters/socket-io.adapter';
import { Env } from '@/libs/configs/env.config';
import { loggerConfig } from '@/libs/configs/logger.config';
import { formatError } from '@/libs/utils/format-error.util';

class BootstrapApplication {
  private app: INestApplication;
  private configService: ConfigService;

  async run() {
    this.app = await NestFactory.create(AppModule, {
      logger: loggerConfig,
      // Svix signs the exact bytes Clerk sent (see ClerkWebhookGuard)
      rawBody: true,
    });
    // Runs onModuleDestroy on SIGTERM/SIGINT: closes Chromium and DB pools
    this.app.enableShutdownHooks();

    this.configService = this.app.get(ConfigService);
    const port = this.configService.getOrThrow<number>(Env.PORT);
    const apiPrefix = this.configService.get<string>(Env.API_PREFIX, 'api');
    const apiVersion = this.configService.get<string>(Env.API_VERSION, '1');

    this.app.setGlobalPrefix(`${apiPrefix}/v${apiVersion}`);

    this.setupMiddleware();

    if (this.configService.get<string>(Env.NODE_ENV) !== 'production') {
      this.setupSwagger();
    }

    await this.app.listen(port);
    Logger.log(
      `Server running on http://localhost:${port}/${apiPrefix}/v${apiVersion}`,
      BootstrapApplication.name,
    );
  }

  private setupSwagger() {
    const document = SwaggerModule.createDocument(
      this.app,
      new DocumentBuilder()
        .setTitle('CraftCV API')
        .setDescription('The API details of the CraftCV application')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('docs', this.app, document);
  }

  private setupMiddleware() {
    this.app.use(cookieParser());
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (validationErrors) => {
          return new BadRequestException(formatError(validationErrors));
        },
      }),
    );

    const origin = this.configService.getOrThrow<string>(Env.FRONTEND_ORIGIN);
    this.app.enableCors({ origin, credentials: true });
    this.app.useWebSocketAdapter(new SocketIoAdapter(this.app, origin));

    this.app.use(helmet());

    const isProduction =
      this.configService.get<string>(Env.NODE_ENV) === 'production';
    // The request id ties each access line to the app logs of that request
    // (set by RequestIdMiddleware, which has run by the time this logs)
    morgan.token('request-id', (req: Request) => req.requestId ?? '-');
    this.app.use(
      morgan(
        isProduction
          ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :request-id'
          : ':method :url :status :response-time ms - :res[content-length] [:request-id]',
      ),
    );
  }
}

new BootstrapApplication().run().catch((error: unknown) => {
  Logger.error('Failed to start the server', error, 'BootstrapApplication');
  process.exit(1);
});
