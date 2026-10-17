import { type Section } from '@/constants/builder-section.constant';

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
