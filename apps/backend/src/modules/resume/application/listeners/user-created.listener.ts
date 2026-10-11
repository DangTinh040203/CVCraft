import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { buildDefaultResume } from '@/modules/resume/application/constants/default-resume.constant';
import type { IResumeRepository } from '@/modules/resume/application/interfaces';
import { RESUME_REPOSITORY_TOKEN } from '@/modules/resume/application/interfaces';
import { User } from '@/modules/user/domain';

@Injectable()
export class UserCreatedListener {
  private readonly logger = new Logger(UserCreatedListener.name);

  constructor(
    @Inject(RESUME_REPOSITORY_TOKEN)
    private readonly resumeRepository: IResumeRepository,
  ) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(user: User) {
    if (!user.id) return;

    try {
      await this.resumeRepository.create(user.id, buildDefaultResume(user));
      this.logger.log(`Initialized default resume for user ${user.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to initialize default resume for user ${user.id}`,
        error,
      );
    }
  }
}
