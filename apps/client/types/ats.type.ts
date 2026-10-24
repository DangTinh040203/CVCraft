import { type Section } from '@/constants/builder-section.constant';

export type AtsSeverity = 'critical' | 'warning' | 'tip';

export interface AtsIssue {
  severity: AtsSeverity;
  /** The builder section to fix it in. */
  section: `${Section}`;
  message: string;
  /** A few of the lines it is about, shortened. */
  examples?: string[];
}

export interface AtsCriterion {
  key: 'contact' | 'sections' | 'length' | 'impact' | 'keywords';
  name: string;
  /** Percent of the overall score. */
  weight: number;
  /** Null when it couldn't be checked (keywords, when the AI fails). */
  score: number | null;
  summary: string;
}

/** What `POST /resumes/ats-check` returns. */
export interface AtsResult {
  /** 0-100, weighted over the criteria that could be checked. */
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

/** What gets rewritten: achievement bullets, or the summary paragraph. */
export type RewriteKind = 'bullets' | 'summary';

export interface RewritePayload {
  kind: RewriteKind;
  /** The field as the editor has it (HTML). */
  text: string;
  role?: string;
  organization?: string;
  /** Ongoing role: written in the present tense. */
  current?: boolean;
}

export interface ResumeSharing {
  isPublic: boolean;
  shareSlug: string | null;
}
