import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { CacheModule } from '@/libs/cache';
import { AppConfigModule } from '@/libs/configs/config.module';
import { Env, validationSchema } from '@/libs/configs/env.config';
import { DatabaseModule } from '@/libs/databases/database.module';
import { GlobalExceptionFilter } from '@/libs/filters/http-exception.filter';
import { ClerkAuthGuard } from '@/libs/guards/clerk-auth.guard';
import { RequestIdMiddleware } from '@/libs/middlewares/request-id.middleware';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    CacheModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
      validationSchema,
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.getOrThrow<number>(Env.THROTTLE_TTL),
          limit: configService.getOrThrow<number>(Env.THROTTLE_LIMIT),
        },
      ],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('{*splat}');
  }
}
