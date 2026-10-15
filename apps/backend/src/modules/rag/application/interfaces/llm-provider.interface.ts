import { type Schema, type ThinkingConfig } from '@google/genai';

export interface LLMSendOptions {
  thinkingConfig?: ThinkingConfig;
}

export interface LLMProvider {
  sendMessage(
    content: string,
    schema?: Schema,
    options?: LLMSendOptions,
  ): Promise<string>;
}

export const LLM_PROVIDER_TOKEN = Symbol('LLM_PROVIDER_TOKEN');
