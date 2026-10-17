export class SentApplication {
  id: string;
  userId: string;
  toEmail: string;
  subject: string;
  jobTitle: string | null;
  company: string | null;
  providerMessageId: string | null;
  createdAt: Date;

  constructor(partial: Partial<SentApplication>) {
    Object.assign(this, partial);
  }
}
