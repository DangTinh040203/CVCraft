import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  type RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Request } from 'express';
import { Webhook } from 'svix';

import { Env } from '@/libs/configs/env.config';
import { ClerkWebhook } from '@/modules/user/domain';

@Injectable()
export class ClerkWebhookGuard implements CanActivate {
  private readonly logger = new Logger(ClerkWebhookGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RawBodyRequest<Request>>();
    const svixHeaders = {
      'svix-id': request.headers['svix-id'],
      'svix-timestamp': request.headers['svix-timestamp'],
      'svix-signature': request.headers['svix-signature'],
    };

    if (
      !svixHeaders['svix-id'] ||
      !svixHeaders['svix-timestamp'] ||
      !svixHeaders['svix-signature']
    ) {
      throw new ForbiddenException('Missing required svix headers');
    }

    const wh = new Webhook(
      this.configService.getOrThrow(Env.CLERK_WEBHOOK_SECRET),
    );

    // The signature covers the exact bytes sent; re-serializing the parsed
    // body can change them (escapes, key order) and fail verification
    if (!request.rawBody) {
      this.logger.error('Raw body missing; is rawBody enabled in main.ts?');
      throw new ForbiddenException('Webhook verification failed');
    }

    try {
      const evt = wh.verify(
        request.rawBody.toString('utf8'),
        svixHeaders as Record<string, string>,
      ) as ClerkWebhook;
      request.clerkEvent = evt;
      return true;
    } catch (err) {
      this.logger.warn(
        `Webhook verification failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new ForbiddenException('Webhook verification failed');
    }
  }
}
