import { type ApplicationStatus } from '@/libs/databases/prisma/generated/enums';
import { type SentApplication } from '@/modules/applications/domain';

export const SENT_APPLICATION_REPOSITORY_TOKEN = Symbol(
  'SENT_APPLICATION_REPOSITORY_TOKEN',
);

export type CreateSentApplication = Pick<
  SentApplication,
  | 'userId'
  | 'toEmail'
  | 'replyTo'
  | 'subject'
  | 'body'
  | 'jobTitle'
  | 'company'
  | 'providerMessageId'
>;

export type UpdateSentApplication = Partial<
  Pick<SentApplication, 'status' | 'notes'>
>;

export interface SentApplicationQuery {
  status?: ApplicationStatus;
  /** Matched against job title, company, recipient and subject. */
  search?: string;
  skip: number;
  take: number;
}

export interface ISentApplicationRepository {
  create(data: CreateSentApplication): Promise<SentApplication>;
  /** Every send in the window, removed ones included (they were sent). */
  countSince(userId: string, since: Date): Promise<number>;
  /** The user's listed applications, newest first. */
  findPage(
    userId: string,
    query: SentApplicationQuery,
  ): Promise<{ items: SentApplication[]; total: number }>;
  countByStatus(userId: string): Promise<Record<ApplicationStatus, number>>;
  /** Null when it isn't the user's, or was removed. */
  update(
    userId: string,
    id: string,
    data: UpdateSentApplication,
  ): Promise<SentApplication | null>;
  /** False when there was nothing of the user's to remove. */
  remove(userId: string, id: string): Promise<boolean>;
}
