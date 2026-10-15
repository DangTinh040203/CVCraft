import {
  ApiError,
  type GenerateContentConfig,
  GoogleGenAI,
  type Schema,
} from '@google/genai';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from '@/libs/configs/env.config';
import {
  type LLMProvider,
  type LLMSendOptions,
} from '@/modules/rag/application/interfaces/llm-provider.interface';

/** Rate limits and overload ("high demand") are usually gone within seconds. */
const RETRYABLE_STATUSES = new Set([429, 500, 503]);
const RETRY_DELAYS_MS = [1000, 3000];
/** Also sent to Gemini as the server deadline, which then answers 504. */
const REQUEST_TIMEOUT_MS = 30_000;

/** A model that stays overloaded or too slow; the next model is tried. */
function isUnavailable(error: unknown) {
  return (
    (error instanceof ApiError &&
      (RETRYABLE_STATUSES.has(error.status) || error.status === 504)) ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

@Injectable()
export class GeminiAdapter implements LLMProvider {
  private readonly logger = new Logger(GeminiAdapter.name);
  private readonly genAI: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    this.genAI = new GoogleGenAI({
      apiKey: this.configService.get<string>(Env.GEMINI_API_KEY),
      httpOptions: { timeout: REQUEST_TIMEOUT_MS },
    });
  }

  async sendMessage(
    content: string,
    schema?: Schema,
    options?: LLMSendOptions,
  ): Promise<string> {
    const config: GenerateContentConfig = {};
    if (schema) {
      config.responseMimeType = 'application/json';
      config.responseSchema = schema;
    }
    if (options?.thinkingConfig) {
      config.thinkingConfig = options.thinkingConfig;
    }

    const models = [
      this.configService.getOrThrow<string>(Env.GEMINI_MODEL),
      this.configService.get<string>(Env.GEMINI_FALLBACK_MODEL),
    ].filter((model, index, all): model is string => {
      return !!model && all.indexOf(model) === index;
    });

    for (const model of models) {
      try {
        return await this.generate(model, content, config);
      } catch (error) {
        this.logger.error(`Gemini request failed (${model})`, error);
        if (!isUnavailable(error)) throw error;
      }
    }
    throw new ServiceUnavailableException(
      'The AI service is busy right now. Please try again in a minute.',
    );
  }

  /** One model, retried briefly while it's rate limited or overloaded. */
  private async generate(
    model: string,
    content: string,
    initialConfig: GenerateContentConfig,
  ): Promise<string> {
    let config = initialConfig;
    const startTime = Date.now();
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await this.genAI.models.generateContent({
          model,
          contents: content,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        if (!response.text) {
          this.logger.error(`Gemini returned an empty response (${model})`);
          throw new InternalServerErrorException();
        }

        this.logger.log(`${model} responded in ${Date.now() - startTime}ms`);
        return response.text;
      } catch (error) {
        // Thinking levels differ per model (3.8-flash rejects MINIMAL); the
        // model's own default beats failing the request
        if (
          error instanceof ApiError &&
          error.status === 400 &&
          config.thinkingConfig &&
          /thinking level/i.test(error.message)
        ) {
          this.logger.warn(
            `${model} rejected the thinking level, using its default`,
          );
          config = { ...config, thinkingConfig: undefined };
          attempt--;
          continue;
        }

        const delay = RETRY_DELAYS_MS[attempt];
        if (
          error instanceof ApiError &&
          RETRYABLE_STATUSES.has(error.status) &&
          delay !== undefined
        ) {
          this.logger.warn(
            `${model} returned ${error.status}, retrying in ${delay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }
}
