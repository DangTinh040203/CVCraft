import { ThinkingLevel } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { extractPdfText } from '@/libs/utils/pdf-text.util';
import { LlmService } from '@/modules/llm/application/services';
import {
  RESUME_PARSER_PROMPT,
  RESUME_SCHEMA,
} from '@/modules/resume/application/constants/resume-parser.constant';
import { toResumeIsoDate } from '@/modules/resume/application/utils/resume-date.util';

type Entry = Record<string, unknown>;

@Injectable()
export class ResumeParserService {
  constructor(private readonly llmService: LlmService) {}

  async parse(file: Express.Multer.File): Promise<Record<string, unknown>> {
    const text = await extractPdfText(file.buffer);

    // A function replacement, so `$&`-style patterns in the CV stay literal
    const prompt = RESUME_PARSER_PROMPT.replace('{cv_text}', () => text);

    const response = await this.llmService.sendMessage(prompt, RESUME_SCHEMA, {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
    });

    let parsed: Entry;
    try {
      parsed = JSON.parse(response) as Entry;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to parse LLM response as JSON',
        { cause: error },
      );
    }
    return this.normalizeDates(parsed);
  }

  /**
   * The editor and `@IsDateString` need ISO dates, and Gemini doesn't always
   * follow the prompt's YYYY-MM. Unreadable dates become null ("Present" for
   * an end date, an empty picker for the rest) rather than "Invalid Date".
   */
  private normalizeDates(resume: Entry): Entry {
    const dated = (items: unknown, fields: string[]) =>
      Array.isArray(items)
        ? items.map((item: Entry) => ({
            ...item,
            ...Object.fromEntries(
              fields.map((field) => [field, toResumeIsoDate(item[field])]),
            ),
          }))
        : [];

    return {
      ...resume,
      educations: dated(resume.educations, ['startDate', 'endDate']),
      workExperiences: dated(resume.workExperiences, ['startDate', 'endDate']),
      certifications: dated(resume.certifications, ['date']),
    };
  }
}
