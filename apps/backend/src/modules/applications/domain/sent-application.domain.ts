import { type ApplicationStatus } from '@/libs/databases/prisma/generated/enums';

export class SentApplication {
  id: string;
  userId: string;
  toEmail: string;
  replyTo: string | null;
  subject: string;
  body: string | null;
  jobTitle: string | null;
  company: string | null;
  status: ApplicationStatus;
  notes: string | null;
  providerMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<SentApplication>) {
    Object.assign(this, partial);
  }
}
