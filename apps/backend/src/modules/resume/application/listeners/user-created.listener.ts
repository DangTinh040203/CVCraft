import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { buildDefaultResume } from '@/modules/resume/application/constants/default-resume.constant';
import type { IResumeRepository } from '@/modules/resume/application/interfaces';
import { RESUME_REPOSITORY_TOKEN } from '@/modules/resume/application/interfaces';
import { ResumeService } from '@/modules/resume/application/services';
import { USER_CREATED_EVENT } from '@/modules/user/application/constants/user-events.constant';
import { User } from '@/modules/user/domain';

@Injectable()
export class UserCreatedListener {
  private readonly logger = new Logger(UserCreatedListener.name);

  constructor(
    @Inject(RESUME_REPOSITORY_TOKEN)
    private readonly resumeRepository: IResumeRepository,
    private readonly resumeService: ResumeService,
  ) {}

  /**
   * Gives every new user their one resume. Errors reach the webhook (it
   * awaits this through `emitAsync`), which fails so Clerk redelivers; the
   * redelivery runs this again, so it must skip a resume that exists.
   */
  @OnEvent(USER_CREATED_EVENT, { suppressErrors: false })
  async handleUserCreatedEvent(user: User) {
    if (await this.resumeRepository.findByUserId(user.id)) {
      this.logger.log(`User ${user.id} already has a resume`);
      return;
    }

    await this.resumeRepository.create(user.id, buildDefaultResume(user));
    // A GET /resumes before this may have cached "no resume" for a minute
    await this.resumeService.invalidateResumeCache(user.id);
    this.logger.log(`Initialized default resume for user ${user.id}`);
  }
}
