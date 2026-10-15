import { type Schema } from '@google/genai';
import { Inject, Injectable } from '@nestjs/common';

import {
  LLM_PROVIDER_TOKEN,
  type LLMProvider,
  type LLMSendOptions,
} from '@/modules/llm/application/interfaces';

@Injectable()
export class LlmService {
  constructor(
    @Inject(LLM_PROVIDER_TOKEN)
    private readonly llmProvider: LLMProvider,
  ) {}

  async sendMessage(
    content: string,
    schema?: Schema,
    options?: LLMSendOptions,
  ): Promise<string> {
    return this.llmProvider.sendMessage(content, schema, options);
  }
}
