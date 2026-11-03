import { type Section } from '@/constants/builder-section.constant';
import { type RewriteKind } from '@/types/ats.type';

export interface MatchCriterion {
  key: 'hardSkills' | 'experience' | 'domain' | 'education' | 'softSkills';
  name: string;
  /** Percent of the overall score. */
  weight: number;
  score: number;
  explanation: string;
}

export interface MatchSuggestion {
  text: string;
  /** The builder section to edit. */
  section: `${Section}`;
}

/** One field `POST /resumes/tailor` rewrote for the job. */
export interface TailorChange {
  /** Stable within one result ("summary", "exp-1"). */
  ref: string;
  section: 'summary' | 'experience' | 'projects';
  /** The work experience or project it belongs to; null for the summary. */
  itemId: string | null;
  kind: RewriteKind;
  /** What the field is, e.g. "Senior Engineer · Acme". */
  title: string;
  original: string[];
  lines: string[];
  /** What the rewrite does for this job, in the JD's language. */
  reason: string;
  /** JD keywords the rewrite brings in, already backed by the resume. */
  keywords: string[];
  /**
   * JD terms the rewrite uses that the resume never mentions: a fair
   * rewording, or a claim the user must check before applying.
   */
  unverified: string[];
}

/** What `POST /resumes/match` returns. */
export interface MatchResult {
  /** False when the pasted text isn't a job posting at all. */
  isValidJobDescription: boolean;
  jobTitle: string | null;
  company: string | null;
  /** Who to apply to, only when the JD names them. */
  contactName: string | null;
  contactEmail: string | null;
  /** Opening line for the application email, in the JD's language. */
  greeting: string | null;
  /** 0-100, weighted from the criteria. */
  overallScore: number;
  summary: string;
  criteria: MatchCriterion[];
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  suggestions: MatchSuggestion[];
}
