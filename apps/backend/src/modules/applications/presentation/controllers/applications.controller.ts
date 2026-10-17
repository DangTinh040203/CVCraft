import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { CurrentDbUser } from '@/libs/decorators';
import { ApplicationsService } from '@/modules/applications/application/services';
import { SendApplicationDto } from '@/modules/applications/presentation/dtos';
import { User } from '@/modules/user/domain';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /** Recent sends and how many are left today. */
  @Get()
  async list(@CurrentDbUser() user: User) {
    const [items, quota] = await Promise.all([
      this.applicationsService.history(user.id),
      this.applicationsService.quota(user.id),
    ]);
    return { items, quota };
  }

  /** Emails a recruiter the application with the resume attached. */
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/send')
  send(@Body() payload: SendApplicationDto, @CurrentDbUser() user: User) {
    return this.applicationsService.send(user, payload);
  }
}
