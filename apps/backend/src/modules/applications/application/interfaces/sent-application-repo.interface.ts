import { type SentApplication } from '@/modules/applications/domain';

export const SENT_APPLICATION_REPOSITORY_TOKEN = Symbol(
  'SENT_APPLICATION_REPOSITORY_TOKEN',
);

export type CreateSentApplication = Omit<SentApplication, 'id' | 'createdAt'>;

export interface ISentApplicationRepository {
  create(data: CreateSentApplication): Promise<SentApplication>;
  countSince(userId: string, since: Date): Promise<number>;
  findRecent(userId: string, limit: number): Promise<SentApplication[]>;
}
