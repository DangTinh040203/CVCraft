import { Module } from '@nestjs/common';

import {
  INTERVIEW_RECORD_REPOSITORY_TOKEN,
  LIVE_INTERVIEW_PROVIDER_TOKEN,
} from '@/modules/interview/application/interfaces';
import {
  InterviewEvaluationService,
  InterviewService,
} from '@/modules/interview/application/services';
import { GeminiLiveAdapter } from '@/modules/interview/infrastructure/adapters';
import { PrismaInterviewRecordRepository } from '@/modules/interview/infrastructure/repositories';
import { InterviewController } from '@/modules/interview/presentation/controllers';
import { InterviewGateway } from '@/modules/interview/presentation/gateways';
import { LlmModule } from '@/modules/llm/llm.module';
import { UserModule } from '@/modules/user/user.module';

/** Voice mock interviews with an AI interviewer, scored when they end. */
@Module({
  imports: [LlmModule, UserModule],
  controllers: [InterviewController],
  providers: [
    InterviewService,
    InterviewEvaluationService,
    InterviewGateway,
    {
      provide: LIVE_INTERVIEW_PROVIDER_TOKEN,
      useClass: GeminiLiveAdapter,
    },
    {
      provide: INTERVIEW_RECORD_REPOSITORY_TOKEN,
      useClass: PrismaInterviewRecordRepository,
    },
  ],
})
export class InterviewModule {}
