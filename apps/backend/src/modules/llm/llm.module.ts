import { Module } from '@nestjs/common';

import { LLM_PROVIDER_TOKEN } from '@/modules/llm/application/interfaces';
import { LlmService } from '@/modules/llm/application/services';
import { GeminiAdapter } from '@/modules/llm/infrastructure/adapters';

@Module({
  providers: [
    LlmService,
    {
      provide: LLM_PROVIDER_TOKEN,
      useClass: GeminiAdapter,
    },
  ],
  exports: [LlmService],
})
export class LlmModule {}
