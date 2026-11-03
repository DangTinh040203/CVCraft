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
  type RewriteKind,
} from '@/modules/resume/application/constants/resume-rewrite.constant';
import {
  TAILOR_MAX_CHANGES,
  TAILOR_MAX_KEYWORDS,
  TAILOR_PROMPT,
  TAILOR_SCHEMA,
} from '@/modules/resume/application/constants/resume-tailor.constant';
import { resumeToText } from '@/modules/resume/application/services/resume-matching.service';
import { richTextLines } from '@/modules/resume/application/utils/rich-text.util';

type Entry = Record<string, unknown>;

/** A field the model may rewrite, as the prompt and the client know it. */
interface TailorField {
  /** Short id for the prompt ("summary", "exp-1", "proj-2"). */
  ref: string;
  section: 'summary' | 'experience' | 'projects';
  /** The work experience or project id; null for the summary. */
  itemId: string | null;
  kind: RewriteKind;
  /** What the field is, for the user ("Senior Engineer · Acme"). */
  title: string;
  original: string[];
  /** The field's header in the prompt. */
  header: string;
}

export interface TailorChange {
  ref: string;
  section: TailorField['section'];
  itemId: string | null;
  kind: RewriteKind;
  title: string;
  /** The field's lines before, to show next to the rewrite. */
  original: string[];
  lines: string[];
  /** What the rewrite does for this job, in the JD's language. */
  reason: string;
  /** JD keywords the rewrite brings in, already backed by the resume. */
  keywords: string[];
  /**
   * JD terms the rewrite uses that appear nowhere in the resume: either a
   * fair rewording (the CV's "web services" as "REST APIs") or a claim the
   * candidate must check before applying.
   */
  unverified: string[];
}

export interface TailorResult {
  changes: TailorChange[];
}

const str = (value: unknown) => (typeof value === 'string' ? value : '');
const list = (value: unknown) =>
  Array.isArray(value) ? (value as Entry[]) : [];
const cleanLine = (line: string) =>
  // The model sometimes keeps the "- " it was given
  line
    .replace(/^\s*[-•*–]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
const sameLines = (a: string[], b: string[]) =>
  a.length === b.length &&
  a.every((line, index) => line.toLowerCase() === b[index].toLowerCase());
/**
 * Whether the text has the term as a whole word or phrase, ignoring case
 * ("AI" doesn't match "maintained"; "Node.js" matches "node.js").
 */
const hasTerm = (text: string, term: string) => {
  const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`,
    'u',
  ).test(text.toLowerCase());
};
const uniqueTerms = (values: unknown[]) => [
  ...new Set(
    values
      .map(str)
      .map((term) => term.trim())
      .filter((term) => term.length > 1),
  ),
];

/** The resume's rewritable fields, in resume order, skipping empty ones. */
function tailorFields(resume: Entry): TailorField[] {
  const fields: TailorField[] = [];

  const summary = richTextLines(resume.overview);
  if (summary.length) {
    fields.push({
      ref: 'summary',
      section: 'summary',
      itemId: null,
      kind: 'summary',
      title: 'Summary',
      original: [summary.join(' ')],
      header: 'summary — Resume summary',
    });
  }

  list(resume.workExperiences).forEach((work, index) => {
    const original = richTextLines(work.description);
    const id = str(work.id);
    if (!original.length || !id) return;
    const role = [str(work.position), str(work.company)].filter(Boolean);
    fields.push({
      ref: `exp-${index + 1}`,
      section: 'experience',
      itemId: id,
      kind: 'bullets',
      title: role.join(' · ') || 'Work experience',
      original,
      header: `bullets — Work experience: ${role.join(' at ')}${
        work.endDate ? '' : ' (current role)'
      }`,
    });
  });

  list(resume.projects).forEach((project, index) => {
    const original = richTextLines(project.responsibilities);
    const id = str(project.id);
    if (!original.length || !id) return;
    const name = [str(project.title), str(project.position)].filter(Boolean);
    fields.push({
      ref: `proj-${index + 1}`,
      section: 'projects',
      itemId: id,
      kind: 'bullets',
      title: name.join(' · ') || 'Project',
      original,
      header: `bullets — Project responsibilities: ${name.join(', role: ')}`,
    });
  });

  return fields;
}

@Injectable()
export class ResumeTailorService {
  constructor(private readonly llmService: LlmService) {}

  /**
   * Rewrites the resume fields that matter most for a job description, so
   * the resume matches it better; nothing is saved, the user reviews each
   * change in the editor.
   */
  async tailor(
    resume: Entry,
    jobDescription: string,
    keywords: string[] = [],
  ): Promise<TailorResult> {
    const fields = tailorFields(resume);
    if (!fields.length) {
      throw new BadRequestException(
        'Add a summary or describe your experience first, then tailor it.',
      );
    }

    const fieldText = fields
      .map(
        (field) =>
          `[${field.ref}] ${field.header}\n${
            field.kind === 'bullets'
              ? field.original.map((line) => `- ${line}`).join('\n')
              : field.original[0]
          }`,
      )
      .join('\n\n');
    const focus = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))]
      .slice(0, TAILOR_MAX_KEYWORDS)
      .join(', ');

    // Function replacements, so `$&`-style patterns stay literal
    const prompt = TAILOR_PROMPT.replace('{cv}', () =>
      PromptSanitizer.sanitize(resumeToText(resume)),
    )
      .replace('{fields}', () => PromptSanitizer.sanitize(fieldText))
      .replace('{keywords}', () =>
        PromptSanitizer.sanitize(focus || 'None given: pick them from the JD'),
      )
      .replace('{jd}', () => PromptSanitizer.sanitize(jobDescription));

    const response = await this.llmService.sendMessage(prompt, TAILOR_SCHEMA, {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    });

    let raw: { changes?: unknown };
    try {
      raw = JSON.parse(response) as { changes?: unknown };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to parse LLM tailor response as JSON',
        { cause: error },
      );
    }

    return {
      changes: this.normalize(
        fields,
        list(raw.changes),
        resumeToText(resume),
        keywords,
      ),
    };
  }

  /**
   * Keeps one change per known field, in resume order: unknown refs, empty
   * rewrites and ones identical to the original are dropped. JD terms the
   * rewrite brings in are split by whether the resume backs them anywhere,
   * since the model can't be trusted to leave unsupported ones out.
   */
  private normalize(
    fields: TailorField[],
    raw: Entry[],
    cvText: string,
    focusKeywords: string[],
  ): TailorChange[] {
    const byRef = new Map<string, Entry>();
    for (const change of raw) {
      const ref = str(change.ref).trim();
      if (!byRef.has(ref)) byRef.set(ref, change);
    }

    const changes: TailorChange[] = [];
    for (const field of fields) {
      const change = byRef.get(field.ref);
      if (!change) continue;

      const cleaned = list(change.lines)
        .map(str)
        .map(cleanLine)
        .filter(Boolean);
      const lines =
        field.kind === 'summary'
          ? cleaned.length
            ? [cleaned.join(' ')]
            : []
          : cleaned.slice(0, REWRITE_MAX_BULLETS);
      if (!lines.length || sameLines(lines, field.original)) continue;

      const text = lines.join(' ');
      const before = field.original.join(' ');
      // Terms the rewrite has and the field didn't
      const added = uniqueTerms([
        ...list(change.keywords),
        ...focusKeywords,
      ]).filter((term) => hasTerm(text, term) && !hasTerm(before, term));
      const keywords = added
        .filter((term) => hasTerm(cvText, term))
        .slice(0, 8);
      const unverified = added
        .filter((term) => !hasTerm(cvText, term))
        .slice(0, 8);

      changes.push({
        ref: field.ref,
        section: field.section,
        itemId: field.itemId,
        kind: field.kind,
        title: field.title,
        original: field.original,
        lines,
        reason: str(change.reason).replace(/\s+/g, ' ').trim(),
        keywords,
        unverified,
      });
    }
    return changes.slice(0, TAILOR_MAX_CHANGES);
  }
}
