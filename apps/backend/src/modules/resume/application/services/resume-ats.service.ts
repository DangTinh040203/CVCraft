import { ThinkingLevel } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';

import { PromptSanitizer } from '@/libs/utils/prompt-sanitizer.util';
import { LlmService } from '@/modules/llm/application/services';
import {
  ATS_CRITERIA,
  ATS_IDEAL_WORDS,
  ATS_KEYWORDS_PROMPT,
  ATS_KEYWORDS_SCHEMA,
  ATS_MAX_BULLET_WORDS,
  ATS_MAX_SUMMARY_WORDS,
  ATS_NUMBER_TARGET,
  type AtsCriterionKey,
  WEAK_OPENERS,
} from '@/modules/resume/application/constants/resume-ats.constant';
import { type MATCH_SECTIONS } from '@/modules/resume/application/constants/resume-matching.constant';
import { resumeToText } from '@/modules/resume/application/services/resume-matching.service';
import {
  richTextLines,
  wordCount,
} from '@/modules/resume/application/utils/rich-text.util';

type Entry = Record<string, unknown>;

export type AtsSeverity = 'critical' | 'warning' | 'tip';

export interface AtsIssue {
  severity: AtsSeverity;
  /** The builder section to fix it in. */
  section: (typeof MATCH_SECTIONS)[number];
  message: string;
  /** A few of the lines it is about, shortened. */
  examples?: string[];
}

export interface AtsCriterion {
  key: AtsCriterionKey;
  name: string;
  weight: number;
  /** Null when it couldn't be checked (keywords, when the model fails). */
  score: number | null;
  summary: string;
}

export interface AtsResult {
  /** Weighted over the criteria that could be checked, 0-100. */
  overallScore: number;
  criteria: AtsCriterion[];
  /** Most severe first. */
  issues: AtsIssue[];
  keywords: {
    targetRole: string | null;
    present: string[];
    missing: string[];
  } | null;
  stats: { words: number; bullets: number; bulletsWithNumbers: number };
}

interface Check {
  score: number;
  summary: string;
  issues: AtsIssue[];
}

const SEVERITY_ORDER: Record<AtsSeverity, number> = {
  critical: 0,
  warning: 1,
  tip: 2,
};

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const LINK = /https?:\/\/|www\.|linkedin\.com|github\.com|gitlab\.com/i;
const LINK_LABEL = /linkedin|github|gitlab|website|portfolio|blog/i;
/** A fill-in left by the AI rewrite, e.g. "[X%]". */
const PLACEHOLDER = /\[[^\]]{1,20}\]/;
const FIRST_PERSON = /\b(I|my|me)\b/;

const str = (value: unknown) => (typeof value === 'string' ? value : '');
const list = (value: unknown) =>
  Array.isArray(value) ? (value as Entry[]) : [];
const clamp = (value: number) => Math.round(Math.min(100, Math.max(0, value)));
const short = (line: string) =>
  line.length > 90 ? `${line.slice(0, 87).trimEnd()}…` : line;
/** "a, b and c" */
const join = (items: string[]) =>
  items.length > 1
    ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
    : (items[0] ?? '');

/** A phone number: mostly digits, and no letters. */
const isPhone = (value: string) =>
  !/[a-z]/i.test(value) && (value.match(/\d/g)?.length ?? 0) >= 8;

/** The achievement lines: job descriptions and project responsibilities. */
function resumeBullets(resume: Entry) {
  const roles = list(resume.workExperiences).map((job) => ({
    name: [str(job.position), str(job.company)].filter(Boolean).join(' at '),
    lines: richTextLines(job.description),
  }));
  const projects = list(resume.projects).map((project) => {
    const responsibilities = richTextLines(project.responsibilities);
    return responsibilities.length
      ? responsibilities
      : richTextLines(project.details);
  });
  return {
    roles,
    bullets: [...roles.flatMap((r) => r.lines), ...projects.flat()],
  };
}

/** Every word a recruiter would read, without labels or markup. */
function resumeWords(resume: Entry) {
  const parts = [
    str(resume.title),
    str(resume.subTitle),
    ...richTextLines(resume.overview),
    ...list(resume.information).map((i) => str(i.value)),
    ...list(resume.skills).flatMap((s) => [str(s.label), str(s.value)]),
    ...list(resume.workExperiences).flatMap((w) => [
      str(w.position),
      str(w.company),
      ...richTextLines(w.description),
    ]),
    ...list(resume.projects).flatMap((p) => [
      str(p.title),
      str(p.subTitle),
      str(p.position),
      str(p.technologies),
      ...richTextLines(p.details),
      ...richTextLines(p.responsibilities),
    ]),
    ...list(resume.educations).flatMap((e) => [
      str(e.school),
      str(e.degree),
      str(e.major),
    ]),
    ...list(resume.certifications).flatMap((c) => [str(c.name), str(c.issuer)]),
    ...list(resume.languages).flatMap((l) => [str(l.name), str(l.description)]),
  ];
  return wordCount(parts.join(' '));
}

export function checkContact(resume: Entry): Check {
  const info = list(resume.information);
  const values = info.map((i) => str(i.value).trim()).filter(Boolean);
  const found = {
    name: !!str(resume.title).trim(),
    email: values.some((v) => EMAIL.test(v)),
    phone: values.some(isPhone),
    link: info.some(
      (i) =>
        LINK.test(str(i.value)) ||
        (LINK_LABEL.test(str(i.label)) && str(i.value).trim()),
    ),
  };
  const issues: AtsIssue[] = [];
  if (!found.name)
    {issues.push({
      severity: 'critical',
      section: 'personal',
      message: 'Add your full name at the top of the resume.',
    });}
  if (!found.email)
    {issues.push({
      severity: 'critical',
      section: 'personal',
      message: 'Add an email address: it is how recruiters and ATS reach you.',
    });}
  if (!found.phone)
    {issues.push({
      severity: 'warning',
      section: 'personal',
      message: 'Add a phone number.',
    });}
  if (!found.link)
    {issues.push({
      severity: 'tip',
      section: 'personal',
      message: 'Add a LinkedIn profile, GitHub or portfolio link.',
    });}

  const missing = (['name', 'email', 'phone', 'link'] as const).filter(
    (k) => !found[k],
  );
  return {
    score:
      (found.name ? 20 : 0) +
      (found.email ? 40 : 0) +
      (found.phone ? 25 : 0) +
      (found.link ? 15 : 0),
    summary: missing.length
      ? `Missing: ${join([...missing])}.`
      : 'Name, email, phone and a link found.',
    issues,
  };
}

export function checkSections(resume: Entry): Check {
  const has = {
    summary: richTextLines(resume.overview).length > 0,
    experience:
      list(resume.workExperiences).length > 0 ||
      list(resume.projects).length > 0,
    education: list(resume.educations).length > 0,
    skills: list(resume.skills).some(
      (s) => str(s.value).trim() || str(s.label).trim(),
    ),
  };
  const issues: AtsIssue[] = [];
  if (!has.experience)
    {issues.push({
      severity: 'critical',
      section: 'experience',
      message:
        'Add your work experience (or projects, if you are just starting out).',
    });}
  if (!has.skills)
    {issues.push({
      severity: 'critical',
      section: 'skills',
      message: 'Add a Skills section: ATS match keywords against it first.',
    });}
  if (!has.summary)
    {issues.push({
      severity: 'warning',
      section: 'summary',
      message:
        'Add a 2-4 sentence summary: it is the first thing recruiters read.',
    });}
  if (!has.education)
    {issues.push({
      severity: 'warning',
      section: 'education',
      message: 'Add your education.',
    });}

  // Not scored, but an ATS reads a wrong date range as a wrong tenure
  const backwards = list(resume.workExperiences).filter(
    (w) =>
      str(w.endDate) && new Date(str(w.endDate)) < new Date(str(w.startDate)),
  );
  if (backwards.length)
    {issues.push({
      severity: 'warning',
      section: 'experience',
      message: 'Some roles end before they start. Check their dates.',
      examples: backwards.map((w) =>
        short([str(w.position), str(w.company)].filter(Boolean).join(' at ')),
      ),
    });}

  const missing = (
    ['summary', 'experience', 'education', 'skills'] as const
  ).filter((k) => !has[k]);
  return {
    score:
      (has.summary ? 20 : 0) +
      (has.experience ? 35 : 0) +
      (has.education ? 20 : 0) +
      (has.skills ? 25 : 0),
    summary: missing.length
      ? `Missing: ${join([...missing])}.`
      : 'Summary, experience, education and skills are all there.',
    issues,
  };
}

export function checkLength(resume: Entry): Check {
  const words = resumeWords(resume);
  const { min, max } = ATS_IDEAL_WORDS;
  const score =
    words < 150
      ? 30
      : words < min
        ? 30 + (70 * (words - 150)) / (min - 150)
        : words <= max
          ? 100
          : words <= 1300
            ? 100 - (40 * (words - max)) / (1300 - max)
            : 50;

  const issues: AtsIssue[] = [];
  if (words < min)
    {issues.push({
      severity: 'warning',
      section: 'experience',
      message: `Your resume has only ${words} words. Aim for 300-800: describe the results of each role.`,
    });}
  else if (words > max)
    {issues.push({
      severity: 'tip',
      section: 'experience',
      message: `${words} words is long for most roles. Cut older or less relevant bullets to stay under ${max}.`,
    });}

  const summaryWords = wordCount(richTextLines(resume.overview).join(' '));
  if (summaryWords > ATS_MAX_SUMMARY_WORDS)
    {issues.push({
      severity: 'tip',
      section: 'summary',
      message: `Your summary is ${summaryWords} words. Keep it under 80.`,
    });}

  const long = resumeBullets(resume).bullets.filter(
    (b) => wordCount(b) > ATS_MAX_BULLET_WORDS,
  );
  if (long.length)
    {issues.push({
      severity: 'tip',
      section: 'experience',
      message: `${long.length} bullet${long.length > 1 ? 's are' : ' is'} over ${ATS_MAX_BULLET_WORDS} words. Split or trim them so they can be skimmed.`,
      examples: long.slice(0, 3).map(short),
    });}

  return { score: clamp(score), summary: `${words} words.`, issues };
}

export function checkImpact(
  resume: Entry,
): Check & { bullets: number; withNumbers: number } {
  const { roles, bullets } = resumeBullets(resume);
  const issues: AtsIssue[] = [];

  const empty = roles.filter((r) => !r.lines.length);
  if (empty.length)
    {issues.push({
      severity: 'critical',
      section: 'experience',
      message: 'Describe what you achieved in every role.',
      examples: empty.map((r) => short(r.name || 'Untitled role')),
    });}

  if (!bullets.length)
    {return {
      score: 0,
      summary: 'No bullets to check yet.',
      issues,
      bullets: 0,
      withNumbers: 0,
    };}

  const withNumbers = bullets.filter((b) => /\d/.test(b));
  const weak = bullets.filter((b) => {
    const lower = b.toLowerCase();
    return WEAK_OPENERS.some((opener) => lower.startsWith(opener));
  });
  const placeholders = bullets.filter((b) => PLACEHOLDER.test(b));
  const firstPerson = [...bullets, ...richTextLines(resume.overview)].filter(
    (b) => FIRST_PERSON.test(b),
  );

  if (placeholders.length)
    {issues.push({
      severity: 'critical',
      section: 'experience',
      message:
        'Fill in the [placeholders] with your real numbers, or remove them.',
      examples: placeholders.slice(0, 3).map(short),
    });}
  if (withNumbers.length / bullets.length < ATS_NUMBER_TARGET)
    {issues.push({
      severity: 'warning',
      section: 'experience',
      message: `Only ${withNumbers.length} of ${bullets.length} bullets include a number. Quantify results: %, time saved, users, revenue, team size.`,
      examples: bullets
        .filter((b) => !/\d/.test(b))
        .slice(0, 3)
        .map(short),
    });}
  if (weak.length)
    {issues.push({
      severity: 'warning',
      section: 'experience',
      message: `${weak.length} bullet${weak.length > 1 ? 's start' : ' starts'} with a duty ("Responsible for", "Worked on"). Lead with an action verb and the result.`,
      examples: weak.slice(0, 3).map(short),
    });}
  if (firstPerson.length)
    {issues.push({
      severity: 'tip',
      section: 'experience',
      message:
        'Drop "I" and "my": resumes are written without the first person.',
      examples: firstPerson.slice(0, 2).map(short),
    });}

  const numberPart = Math.min(
    1,
    withNumbers.length / bullets.length / ATS_NUMBER_TARGET,
  );
  const strongPart = 1 - weak.length / bullets.length;
  return {
    score: clamp(100 * (0.7 * numberPart + 0.3 * strongPart)),
    summary: `${withNumbers.length} of ${bullets.length} bullets have a number; ${weak.length} start weakly.`,
    issues,
    bullets: bullets.length,
    withNumbers: withNumbers.length,
  };
}

@Injectable()
export class ResumeAtsService {
  private readonly logger = new Logger(ResumeAtsService.name);

  constructor(private readonly llmService: LlmService) {}

  /**
   * Checks a resume (as the editor has it) the way an ATS and a recruiter
   * skim it, without a job description.
   */
  async check(resume: Entry): Promise<AtsResult> {
    const keywordsPromise = this.checkKeywords(resume);
    const impact = checkImpact(resume);
    const checks: Record<Exclude<AtsCriterionKey, 'keywords'>, Check> = {
      contact: checkContact(resume),
      sections: checkSections(resume),
      length: checkLength(resume),
      impact,
    };
    const keywords = await keywordsPromise;

    const criteria: AtsCriterion[] = ATS_CRITERIA.map(
      ({ key, name, weight }) => {
        if (key !== 'keywords') {
          const { score, summary } = checks[key];
          return { key, name, weight, score, summary };
        }
        const total = keywords
          ? keywords.present.length + keywords.missing.length
          : 0;
        return {
          key,
          name,
          weight,
          score:
            keywords && total
              ? clamp((100 * keywords.present.length) / total)
              : null,
          summary: !keywords
            ? "Couldn't check keywords this time."
            : total
              ? `${keywords.present.length} of ${total} common keywords${keywords.targetRole ? ` for ${keywords.targetRole}` : ''}.`
              : 'Not enough content to tell the target role.',
        };
      },
    );

    const scored = criteria.filter((c) => c.score !== null);
    const weights = scored.reduce((sum, c) => sum + c.weight, 0);
    const overallScore = weights
      ? Math.round(
          scored.reduce((sum, c) => sum + c.score! * c.weight, 0) / weights,
        )
      : 0;

    return {
      overallScore,
      criteria,
      issues: Object.values(checks)
        .flatMap((c) => c.issues)
        // Stable: within a severity, the criteria order is kept
        .sort(
          (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
        ),
      keywords,
      stats: {
        words: resumeWords(resume),
        bullets: impact.bullets,
        bulletsWithNumbers: impact.withNumbers,
      },
    };
  }

  /**
   * The keywords recruiters search for the resume's target role. Best
   * effort: without them the rest of the check still stands.
   */
  private async checkKeywords(resume: Entry): Promise<AtsResult['keywords']> {
    const text = resumeToText(resume);
    try {
      const response = await this.llmService.sendMessage(
        ATS_KEYWORDS_PROMPT.replace('{cv}', () =>
          PromptSanitizer.sanitize(text),
        ),
        ATS_KEYWORDS_SCHEMA,
        {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          temperature: 0,
        },
      );
      const raw = JSON.parse(response) as Entry;
      const haystack = text.toLowerCase();
      const present: string[] = [];
      const missing: string[] = [];
      const seen = new Set<string>();
      for (const item of list(raw.keywords)) {
        const keyword = str(item.keyword).trim();
        const key = keyword.toLowerCase();
        if (!keyword || seen.has(key)) continue;
        seen.add(key);
        // A keyword written in the resume is there, whatever the model says
        (item.present === true || haystack.includes(key)
          ? present
          : missing
        ).push(keyword);
      }
      return {
        targetRole: str(raw.targetRole).trim() || null,
        present: present.slice(0, 15),
        missing: missing.slice(0, 15),
      };
    } catch (error) {
      this.logger.warn(
        `ATS keyword check failed, scoring without it: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
