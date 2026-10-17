import { type ExportPdfPayload } from '@/services/pdf.service';
import { type MatchResult } from '@/types/match.type';
import { type Resume } from '@/types/resume.type';

export type EmailTone = 'professional' | 'warm' | 'concise';

/** `POST /resumes/email`: a draft to review before sending. */
export interface ApplicationEmailDraft {
  subject: string;
  body: string;
  /** "[Company Name]"-style gaps the AI left. */
  placeholders: string[];
}

export interface WriteEmailPayload {
  resume: Resume;
  jobDescription: string;
  tone: EmailTone;
  /** Salutation to open with, e.g. "Dear Ms. Lee,". */
  greeting?: string;
  match?: Pick<
    MatchResult,
    'jobTitle' | 'company' | 'strengths' | 'matchedKeywords'
  >;
}

export interface SendQuota {
  /** Whether sending is configured on the server at all. */
  available: boolean;
  limit: number;
  used: number;
  remaining: number;
}

/** Where an application stands, as the user tracks it. */
export type ApplicationStatus =
  'SENT' | 'REPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface SentApplication {
  id: string;
  toEmail: string;
  /** Where replies go. */
  replyTo: string | null;
  subject: string;
  /** The message as sent (null for early sends that didn't keep it). */
  body: string | null;
  jobTitle: string | null;
  company: string | null;
  status: ApplicationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationsQuery {
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** `GET /applications`. */
export interface ApplicationsPage {
  items: SentApplication[];
  total: number;
  page: number;
  pageSize: number;
  /** Listed applications in each status, across all pages. */
  counts: Record<ApplicationStatus, number>;
  quota: SendQuota;
}

export interface UpdateApplicationPayload {
  status?: ApplicationStatus;
  notes?: string;
}

export interface SendApplicationPayload {
  to: string;
  subject: string;
  body: string;
  jobTitle?: string;
  company?: string;
  /** The resume to attach, as exported. */
  cv: ExportPdfPayload;
}
