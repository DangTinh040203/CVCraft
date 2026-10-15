import { ThinkingLevel } from '@google/genai';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

import { RagService } from '@/modules/rag/application/services/rag.service';
import {
  RESUME_PARSER_PROMPT,
  RESUME_SCHEMA,
} from '@/modules/resume/application/constants/resume-parser.constant';

@Injectable()
export class ResumeParserService {
  constructor(private readonly ragService: RagService) {}

  async parse(file: Express.Multer.File): Promise<Record<string, unknown>> {
    const parser = new PDFParse({ data: file.buffer });
    let text: string;
    let pages: Array<{ text: string }>;
    try {
      ({ text, pages } = await parser.getText());
    } finally {
      await parser.destroy();
    }

    // A scanned PDF has no text layer; Gemini would only invent a resume.
    // Checked per page: the joined text always has "-- 1 of 1 --" markers
    if (pages.every((page) => !page.text.trim())) {
      throw new BadRequestException(
        'No text found in this PDF. Scanned resumes are not supported yet.',
      );
    }

    // A function replacement, so `$&`-style patterns in the CV stay literal
    const prompt = RESUME_PARSER_PROMPT.replace('{cv_text}', () => text);

    const response = await this.ragService.sendMessage(prompt, RESUME_SCHEMA, {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
    });

    try {
      return JSON.parse(response) as Record<string, unknown>;
    } catch {
      throw new InternalServerErrorException(
        'Failed to parse LLM response as JSON',
      );
    }
  }
}
