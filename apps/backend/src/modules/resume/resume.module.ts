import { Logger, Module } from '@nestjs/common';

import { RESUME_REPOSITORY_TOKEN } from '@/modules/resume/application/interfaces';
import { UserCreatedListener } from '@/modules/resume/application/listeners/user-created.listener';
import { ResumeService } from '@/modules/resume/application/services';
import { PrismaAdapterResumeRepository } from '@/modules/resume/infrastructure/repositories';
import { ResumeController } from '@/modules/resume/presentation/controllers';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule],
  providers: [
    Logger,
    ResumeService,
    UserCreatedListener,

    {
      provide: RESUME_REPOSITORY_TOKEN,
      useClass: PrismaAdapterResumeRepository,
    },
  ],
  controllers: [ResumeController],
  exports: [ResumeService, RESUME_REPOSITORY_TOKEN],
})
export class ResumeModule {}
