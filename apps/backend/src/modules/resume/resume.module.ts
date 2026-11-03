import { Module } from '@nestjs/common';

import { LlmModule } from '@/modules/llm/llm.module';
import { RESUME_REPOSITORY_TOKEN } from '@/modules/resume/application/interfaces';
import { UserCreatedListener } from '@/modules/resume/application/listeners/user-created.listener';
import {
  ResumeAtsService,
  ResumeEmailService,
  ResumeMatchingService,
  ResumeParserService,
  ResumeRewriteService,
  ResumeService,
  ResumeTailorService,
} from '@/modules/resume/application/services';
import { PrismaAdapterResumeRepository } from '@/modules/resume/infrastructure/repositories';
import {
  PublicResumeController,
  ResumeController,
} from '@/modules/resume/presentation/controllers';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [LlmModule, UserModule],
  providers: [
    ResumeService,
    ResumeParserService,
    ResumeMatchingService,
    ResumeEmailService,
    ResumeRewriteService,
    ResumeTailorService,
    ResumeAtsService,
    UserCreatedListener,

    {
      provide: RESUME_REPOSITORY_TOKEN,
      useClass: PrismaAdapterResumeRepository,
    },
  ],
  controllers: [ResumeController, PublicResumeController],
  exports: [ResumeService, RESUME_REPOSITORY_TOKEN],
})
export class ResumeModule {}
