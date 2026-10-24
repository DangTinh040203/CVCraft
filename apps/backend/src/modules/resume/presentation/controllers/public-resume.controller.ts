import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '@/libs/decorators';
import { ResumeService } from '@/modules/resume/application/services';

/** Resumes their owners shared by link, readable without an account. */
@Controller('public/resumes')
export class PublicResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Get('/:slug')
  findShared(@Param('slug') slug: string) {
    return this.resumeService.findPublic(slug);
  }
}
