import { Controller, Get, HttpStatus, Logger, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { type Response } from 'express';

import { CacheService } from '@/libs/cache';
import { PrismaService } from '@/libs/databases/prisma.service';
import { Public } from '@/libs/decorators/public.decorator';

/** A check that hangs (e.g. Redis reconnecting) counts as down. */
const CHECK_TIMEOUT_MS = 2_000;

type CheckStatus = 'up' | 'down';

async function check(run: () => Promise<unknown>): Promise<CheckStatus> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timed out')), CHECK_TIMEOUT_MS);
  });
  try {
    await Promise.race([run(), timeout]);
    return 'up';
  } catch {
    return 'down';
  } finally {
    clearTimeout(timer);
  }
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 200 when Postgres and Redis both answer, otherwise 503 with which one
   * is down (set directly: the error filter would drop the `checks`).
   */
  @Get()
  @Public()
  @SkipThrottle()
  async check(@Res({ passthrough: true }) response: Response) {
    const [database, cache] = await Promise.all([
      check(() => this.prisma.$queryRaw`SELECT 1`),
      check(() => this.cacheService.ping()),
    ]);
    const healthy = database === 'up' && cache === 'up';

    if (!healthy) {
      this.logger.warn(`Unhealthy: database ${database}, cache ${cache}`);
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return {
      status: healthy ? 'ok' : 'error',
      checks: { database, cache },
      timestamp: new Date().toISOString(),
    };
  }
}
