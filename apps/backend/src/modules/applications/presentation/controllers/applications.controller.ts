import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { CurrentDbUser } from '@/libs/decorators';
import { ApplicationsService } from '@/modules/applications/application/services';
import {
  ListApplicationsDto,
  SendApplicationDto,
  UpdateApplicationDto,
} from '@/modules/applications/presentation/dtos';
import { User } from '@/modules/user/domain';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /** A page of sent applications, the count per status and today's quota. */
  // Above the global limit: filtering, searching and paging each fetch a page
  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Get()
  async list(@Query() query: ListApplicationsDto, @CurrentDbUser() user: User) {
    const [page, quota] = await Promise.all([
      this.applicationsService.list(user.id, query),
      this.applicationsService.quota(user.id),
    ]);
    return { ...page, quota };
  }

  /** Emails a recruiter the application with the resume attached. */
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/send')
  send(@Body() payload: SendApplicationDto, @CurrentDbUser() user: User) {
    return this.applicationsService.send(user, payload);
  }

  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Patch('/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateApplicationDto,
    @CurrentDbUser() user: User,
  ) {
    return this.applicationsService.update(user.id, id, payload);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentDbUser() user: User) {
    return this.applicationsService.remove(user.id, id);
  }
}
