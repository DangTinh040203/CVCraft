import { verifyToken } from '@clerk/backend';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { Env } from '@/libs/configs/env.config';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // WebSocket handshakes authenticate in their gateway (InterviewGateway)
    if (context.getType() === 'ws') {
      return true;
    }

    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.slice(7);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: this.configService.getOrThrow(Env.CLERK_SECRET_KEY),
      });

      // Attach the auth payload to the request object
      request.auth = payload;

      return true;
    } catch (error) {
      // Expired vs. bad signature: useful when chasing 401s, too noisy as warn
      this.logger.debug(
        `Token rejected: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException('Invalid token');
    }
  }
}
