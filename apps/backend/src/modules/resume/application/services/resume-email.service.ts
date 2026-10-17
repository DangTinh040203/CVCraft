import { ThinkingLevel } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PromptSanitizer } from '@/libs/utils/prompt-sanitizer.util';
import { LlmService } from '@/modules/llm/application/services';
import {
  APPLICATION_EMAIL_PROMPT,
  APPLICATION_EMAIL_SCHEMA,
  EMAIL_TONES,
  type EmailTone,
} from '@/modules/resume/application/constants/resume-email.constant';
import { resumeToText } from '@/modules/resume/application/services/resume-matching.service';
import { contactSignature } from '@/modules/resume/application/utils/contact-signature.util';

/** What a match found, to steer the email toward the strongest points. */
export interface EmailMatchContext {
  jobTitle?: string | null;
  company?: string | null;
  strengths?: string[];
  matchedKeywords?: string[];
}

export interface WriteEmailInput {
  resume: Record<string, unknown>;
  jobDescription: string;
  tone: EmailTone;
  /** The salutation line to open with, e.g. "Dear Ms. Lee,". */
  greeting?: string;
  match?: EmailMatchContext;
}

export interface ApplicationEmail {
  subject: string;
  body: string;
  /** "[Company Name]"-style gaps left in the text, for the user to fill. */
  placeholders: string[];
}

const text = (value: unknown) => (typeof value === 'string' ? value : '');

@Injectable()
export class ResumeEmailService {
  constructor(private readonly llmService: LlmService) {}

  /** Drafts the email a candidate sends to apply, from their resume and the JD. */
  async write(input: WriteEmailInput): Promise<ApplicationEmail> {
    const chosenGreeting = input.greeting?.replace(/\s+/g, ' ').trim();
    const greeting = chosenGreeting
      ? `"${chosenGreeting}"`
      : 'one addressing the hiring team, in the JD\'s language (e.g. "Dear Hiring Team," / "Kính gửi Bộ phận Tuyển dụng,").';
    const match = input.match
      ? [
          input.match.jobTitle && `Role: ${input.match.jobTitle}`,
          input.match.company && `Company: ${input.match.company}`,
          input.match.strengths?.length &&
            `Strengths:\n- ${input.match.strengths.join('\n- ')}`,
          input.match.matchedKeywords?.length &&
            `Matching keywords: ${input.match.matchedKeywords.join(', ')}`,
        ]
          .filter(Boolean)
          .join('\n')
      : 'None';

    // Function replacements, so `$&`-style patterns stay literal
    const prompt = APPLICATION_EMAIL_PROMPT.replace('{greeting}', () =>
      // The greeting is user input too
      PromptSanitizer.sanitizeLight(greeting),
    )
      .replace('{tone}', () => EMAIL_TONES[input.tone])
      .replace('{cv}', () =>
        PromptSanitizer.sanitize(resumeToText(input.resume)),
      )
      .replace('{jd}', () => PromptSanitizer.sanitize(input.jobDescription))
      .replace('{match}', () => PromptSanitizer.sanitize(match));

    const response = await this.llmService.sendMessage(
      prompt,
      APPLICATION_EMAIL_SCHEMA,
      { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } },
    );

    let raw: { subject?: unknown; body?: unknown };
    try {
      raw = JSON.parse(response) as typeof raw;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to parse LLM email response as JSON',
        { cause: error },
      );
    }

    const subject = text(raw.subject).replace(/\s+/g, ' ').trim();
    let draft = text(raw.body)
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    if (!subject || !draft) {
      throw new InternalServerErrorException('The AI returned an empty email');
    }
    // The chosen greeting verbatim: the model's opening line (a salutation
    // by the prompt's format) may reword it
    if (chosenGreeting) {
      const [first, ...rest] = draft.split('\n');
      const opensWithGreeting = first.length <= 120 && /[,:!]$/.test(first);
      draft = opensWithGreeting
        ? [chosenGreeting, ...rest].join('\n')
        : `${chosenGreeting}\n\n${draft}`;
    }
    // Contact details go under the name the draft signs with, copied from
    // the resume rather than written by the model
    const signature = contactSignature(input.resume, draft);
    const body = signature.length ? `${draft}\n${signature.join('\n')}` : draft;

    return {
      subject,
      body,
      placeholders: [
        ...new Set(`${subject}\n${body}`.match(/\[[^\]\n]{2,40}\]/g) ?? []),
      ],
    };
  }
}
