import { Controller, Get } from '@nestjs/common';

import { CurrentDbUser } from '@/libs/decorators';
import { InterviewService } from '@/modules/interview/application/services';
import { User } from '@/modules/user/domain';

/** The interview itself runs over Socket.IO (InterviewGateway). */
@Controller('interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get('/quota')
  quota(@CurrentDbUser() user: User) {
    return this.interviewService.quota(user.id);
  }
}
