import { ThinkingLevel } from '@google/genai';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { PromptSanitizer } from '@/libs/utils/prompt-sanitizer.util';
import { LlmService } from '@/modules/llm/application/services';
import {
  REWRITE_MAX_BULLETS,
  REWRITE_PROMPT,
  REWRITE_RULES,
  REWRITE_SCHEMA,
  type RewriteKind,
} from '@/modules/resume/application/constants/resume-rewrite.constant';
import { richTextLines } from '@/modules/resume/application/utils/rich-text.util';

export interface RewriteInput {
  kind: RewriteKind;
  /** The field as the editor has it (HTML or plain text). */
  text: string;
  /** Job title or project role, for the tone and tense. */
  role?: string;
  /** Company or project name. */
  organization?: string;
  /** Whether the role is ongoing (present tense). */
  current?: boolean;
}

export interface RewriteResult {
  /** Bullets in order; a summary is a single item. */
  lines: string[];
}

@Injectable()
export class ResumeRewriteService {
  constructor(private readonly llmService: LlmService) {}

  /** Rewrites one field of the resume; nothing is saved. */
  async rewrite(input: RewriteInput): Promise<RewriteResult> {
    const original = richTextLines(input.text);
    if (!original.length) {
      throw new BadRequestException('Write something first, then improve it.');
    }

    const context = [
      input.role && `Role: ${input.role}`,
      input.organization && `Organization: ${input.organization}`,
      input.kind === 'bullets' &&
        `Current role: ${input.current ? 'yes' : 'no'}`,
    ]
      .filter(Boolean)
      .join('\n');

    const prompt = REWRITE_PROMPT.replace(
      '{rules}',
      () => REWRITE_RULES[input.kind],
    )
      .replace('{context}', () => PromptSanitizer.sanitize(context || 'None'))
      .replace('{text}', () =>
        PromptSanitizer.sanitize(
          input.kind === 'bullets'
            ? original.map((line) => `- ${line}`).join('\n')
            : original.join(' '),
        ),
      );

    const response = await this.llmService.sendMessage(prompt, REWRITE_SCHEMA, {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    });

    let raw: { lines?: unknown };
    try {
      raw = JSON.parse(response) as { lines?: unknown };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to parse LLM rewrite response as JSON',
        { cause: error },
      );
    }

    const lines = (Array.isArray(raw.lines) ? raw.lines : [])
      .filter((line): line is string => typeof line === 'string')
      // The model sometimes keeps the "- " it was given
      .map((line) =>
        line
          .replace(/^\s*[-•*–]\s*/, '')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter(Boolean);

    if (!lines.length) {
      throw new InternalServerErrorException('LLM returned an empty rewrite');
    }
    return {
      lines:
        input.kind === 'summary'
          ? [lines.join(' ')]
          : lines.slice(0, REWRITE_MAX_BULLETS),
    };
  }
}
