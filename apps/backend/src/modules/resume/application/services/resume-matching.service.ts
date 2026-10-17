import { ThinkingLevel } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PromptSanitizer } from '@/libs/utils/prompt-sanitizer.util';
import { LlmService } from '@/modules/llm/application/services';
import {
  MATCH_CRITERIA,
  MATCH_CV_JD_PROMPT,
  MATCH_CV_JD_SCHEMA,
  MATCH_SECTIONS,
  type MatchCriterionKey,
} from '@/modules/resume/application/constants/resume-matching.constant';

type Entry = Record<string, unknown>;
type Section = (typeof MATCH_SECTIONS)[number];

export interface MatchCriterion {
  key: MatchCriterionKey;
  name: string;
  weight: number;
  score: number;
  explanation: string;
}

export interface MatchResult {
  isValidJobDescription: boolean;
  jobTitle: string | null;
  company: string | null;
  /** Who to apply to, when the JD names them (checked against the JD). */
  contactName: string | null;
  contactEmail: string | null;
  /** Opening line for the application email, in the JD's language. */
  greeting: string | null;
  /** Weighted from the criteria, 0-100. */
  overallScore: number;
  summary: string;
  criteria: MatchCriterion[];
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  suggestions: Array<{ text: string; section: Section }>;
}

const str = (value: unknown) => (typeof value === 'string' ? value : '');
const list = (value: unknown) =>
  Array.isArray(value) ? (value as Entry[]) : [];
/** Rich-text fields (editor HTML) as plain text. */
const plain = (value: unknown) =>
  str(value)
    .replace(/<\/(p|li|div)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{2,}/g, '\n')
    .trim();
/** "2021-03-01T..." as "2021-03"; a missing end date is "Present". */
const month = (value: unknown, fallback = '') =>
  str(value).slice(0, 7) || fallback;
const clampScore = (value: unknown) =>
  Math.round(Math.min(100, Math.max(0, Number(value) || 0)));
const strings = (value: unknown, max: number) =>
  [
    ...new Set(
      list(value)
        .map(str)
        .map((s) => s.trim()),
    ),
  ]
    .filter(Boolean)
    .slice(0, max);

/**
 * The resume as compact text for the prompt: the editor's shape (ids, order,
 * HTML) costs tokens and says nothing the model needs.
 */
export function resumeToText(resume: Entry): string {
  const lines: string[] = [];
  const add = (heading: string, items: string[]) => {
    const kept = items.filter((item) => item.trim());
    if (kept.length) lines.push(`## ${heading}`, ...kept, '');
  };

  add('Candidate', [
    `Name: ${str(resume.title)}`,
    `Headline: ${str(resume.subTitle)}`,
  ]);
  add('Summary', [plain(resume.overview)]);
  add(
    'Contact',
    list(resume.information).map((i) => `${str(i.label)}: ${str(i.value)}`),
  );
  add(
    'Skills',
    list(resume.skills).map((s) =>
      [str(s.label), str(s.value)].filter(Boolean).join(': '),
    ),
  );
  add(
    'Work experience',
    list(resume.workExperiences).map(
      (w) =>
        `- ${str(w.position)} at ${str(w.company)} (${month(w.startDate)} – ${month(w.endDate, 'Present')})\n${plain(w.description)}`,
    ),
  );
  add(
    'Projects',
    list(resume.projects).map((p) =>
      [
        `- ${str(p.title)}${p.subTitle ? ` (${str(p.subTitle)})` : ''}`,
        p.position && `Role: ${str(p.position)}`,
        p.domain && `Domain: ${str(p.domain)}`,
        p.technologies && `Technologies: ${str(p.technologies)}`,
        plain(p.details),
        plain(p.responsibilities),
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  );
  add(
    'Education',
    list(resume.educations).map(
      (e) =>
        `- ${str(e.degree)}, ${str(e.major)} — ${str(e.school)} (${month(e.startDate)} – ${month(e.endDate, 'Present')})`,
    ),
  );
  add(
    'Certifications',
    list(resume.certifications).map(
      (c) => `- ${str(c.name)}, ${str(c.issuer)} (${month(c.date)})`,
    ),
  );
  add(
    'Languages',
    list(resume.languages).map(
      (l) => `- ${str(l.name)}: ${str(l.description)}`,
    ),
  );
  return lines.join('\n').trim();
}

@Injectable()
export class ResumeMatchingService {
  constructor(private readonly llmService: LlmService) {}

  /**
   * Scores a resume (as the editor has it, saved or not) against a job
   * description.
   */
  async match(resume: Entry, jobDescription: string): Promise<MatchResult> {
    // Function replacements, so `$&`-style patterns stay literal
    const prompt = MATCH_CV_JD_PROMPT.replace('{cv}', () =>
      PromptSanitizer.sanitize(resumeToText(resume)),
    ).replace('{jd}', () => PromptSanitizer.sanitize(jobDescription));

    const response = await this.llmService.sendMessage(
      prompt,
      MATCH_CV_JD_SCHEMA,
      // Weighing evidence benefits from a little reasoning, unlike parsing;
      // temperature 0 keeps re-analyzing an unchanged resume from moving
      // the score, which would read as the edits not helping
      {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        temperature: 0,
      },
    );

    let raw: Entry;
    try {
      raw = JSON.parse(response) as Entry;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to parse LLM match response as JSON',
        { cause: error },
      );
    }
    return this.normalize(raw, jobDescription);
  }

  /**
   * Fills in every criterion (in a fixed order, with its weight), clamps the
   * scores and computes the overall score from them, so the numbers always
   * add up whatever the model returned.
   */
  private normalize(raw: Entry, jobDescription: string): MatchResult {
    const valid = raw.isValidJobDescription !== false;
    // A recipient the JD doesn't actually mention would be made up: dropped,
    // and so is a greeting addressing them
    const jd = jobDescription.toLowerCase();
    const name = str(raw.contactName).trim();
    const contactName = name && jd.includes(name.toLowerCase()) ? name : null;
    const email = str(raw.contactEmail).trim();
    const contactEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      jd.includes(email.toLowerCase())
        ? email
        : null;
    const greeting =
      name && !contactName ? '' : str(raw.greeting).replace(/\s+/g, ' ').trim();
    const returned = new Map(list(raw.criteria).map((c) => [str(c.key), c]));
    const criteria = MATCH_CRITERIA.map(({ key, name, weight }) => {
      const found = returned.get(key);
      return {
        key,
        name,
        weight,
        score: valid ? clampScore(found?.score) : 0,
        explanation: str(found?.explanation),
      };
    });
    const overallScore = Math.round(
      criteria.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0),
    );

    return {
      isValidJobDescription: valid,
      jobTitle: str(raw.jobTitle).trim() || null,
      company: str(raw.company).trim() || null,
      contactName: valid ? contactName : null,
      contactEmail: valid ? contactEmail : null,
      greeting: valid ? greeting.slice(0, 120) || null : null,
      overallScore,
      summary: str(raw.summary),
      criteria,
      matchedKeywords: valid ? strings(raw.matchedKeywords, 15) : [],
      missingKeywords: valid ? strings(raw.missingKeywords, 15) : [],
      strengths: valid ? strings(raw.strengths, 5) : [],
      suggestions: valid
        ? list(raw.suggestions)
            .map((s) => ({
              text: str(s.text).trim(),
              section: (MATCH_SECTIONS as readonly string[]).includes(
                str(s.section),
              )
                ? (str(s.section) as Section)
                : 'summary',
            }))
            .filter((s) => s.text)
            .slice(0, 6)
        : [],
    };
  }
}
