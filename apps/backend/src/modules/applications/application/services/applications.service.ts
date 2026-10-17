import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from '@/libs/configs/env.config';
import {
  type ISentApplicationRepository,
  SENT_APPLICATION_REPOSITORY_TOKEN,
} from '@/modules/applications/application/interfaces';
import { type SentApplication } from '@/modules/applications/domain';
import { MailService } from '@/modules/mail/application/services';
import {
  PdfExportService,
  type PrintPayload,
} from '@/modules/pdf/application/services';
import { type User } from '@/modules/user/domain';

/** Sends count toward the limit for this long after they go out. */
const QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000;
const HISTORY_SIZE = 20;

export interface SendApplicationInput {
  to: string;
  subject: string;
  body: string;
  jobTitle?: string;
  company?: string;
  /** The resume to attach, rendered like an export. */
  cv: PrintPayload;
}

export interface SendQuota {
  /** Whether email sending is configured at all. */
  available: boolean;
  limit: number;
  used: number;
  remaining: number;
}

/** "Jane Doe" -> "Jane-Doe-Resume.pdf" (ASCII only: some clients mangle the rest). */
function attachmentName(candidate: string) {
  const slug = candidate
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug || 'Resume'}${slug ? '-Resume' : ''}.pdf`;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The email address on the resume itself (its contact section): the one the
 * candidate wants recruiters to use. A contact labelled as email wins over
 * any other value that happens to be an address.
 */
export function resumeContactEmail(resume: Record<string, unknown>) {
  const contacts = Array.isArray(resume.information)
    ? (resume.information as Array<Record<string, unknown>>)
    : [];
  const values = contacts.map((contact) => ({
    label: typeof contact.label === 'string' ? contact.label : '',
    value: typeof contact.value === 'string' ? contact.value.trim() : '',
  }));
  const isEmail = ({ value }: { value: string }) => EMAIL.test(value);
  return (
    values.find((c) => /e-?mail|thư/i.test(c.label) && isEmail(c)) ??
    values.find(isEmail)
  )?.value;
}

/**
 * Application emails sent for the user: from our verified address under the
 * candidate's name, with replies and a copy going to the email on their
 * resume (their account email when it has none), and the resume attached.
 * Capped per user per day, as the vendor's quota is shared.
 */
@Injectable()
export class ApplicationsService {
  private readonly dailyLimit: number;

  constructor(
    @Inject(SENT_APPLICATION_REPOSITORY_TOKEN)
    private readonly repository: ISentApplicationRepository,
    private readonly mailService: MailService,
    private readonly pdfExportService: PdfExportService,
    configService: ConfigService,
  ) {
    this.dailyLimit = configService.getOrThrow<number>(
      Env.MAIL_DAILY_LIMIT_PER_USER,
    );
  }

  async quota(userId: string): Promise<SendQuota> {
    const used = await this.repository.countSince(
      userId,
      new Date(Date.now() - QUOTA_WINDOW_MS),
    );
    return {
      available: this.mailService.isConfigured(),
      limit: this.dailyLimit,
      used,
      remaining: Math.max(0, this.dailyLimit - used),
    };
  }

  history(userId: string): Promise<SentApplication[]> {
    return this.repository.findRecent(userId, HISTORY_SIZE);
  }

  async send(
    user: User,
    input: SendApplicationInput,
  ): Promise<{ application: SentApplication; quota: SendQuota }> {
    // Checked before the (slow) PDF render
    const quota = await this.quota(user.id);
    if (!quota.available) {
      throw new ServiceUnavailableException(
        'Sending email is not available right now.',
      );
    }
    if (quota.remaining === 0) {
      throw new HttpException(
        `You can send ${quota.limit} applications per 24 hours. Try again later, or open the email in Gmail and send it yourself.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const resumeName = input.cv.resume.title;
    const candidate =
      (typeof resumeName === 'string' && resumeName.trim()) ||
      user.fullName ||
      user.email;
    const pdf = await this.pdfExportService.render(input.cv);
    const to = input.to.trim();
    // Replies (and the candidate's copy) go where the resume says to write,
    // not to our sending address; the sign-in email if the resume has none
    const candidateEmail = resumeContactEmail(input.cv.resume) ?? user.email;
    // A copy for the candidate, unless they're sending to themselves
    const self = to.toLowerCase() === candidateEmail.toLowerCase();

    const { id: providerMessageId } = await this.mailService.send({
      fromName: candidate,
      to: [to],
      cc: self ? undefined : [candidateEmail],
      replyTo: candidateEmail,
      subject: input.subject.trim(),
      text: input.body.trim(),
      attachments: [
        {
          filename: attachmentName(candidate),
          content: Buffer.from(pdf),
          contentType: 'application/pdf',
        },
      ],
    });

    const application = await this.repository.create({
      userId: user.id,
      toEmail: to,
      subject: input.subject.trim(),
      jobTitle: input.jobTitle?.trim() || null,
      company: input.company?.trim() || null,
      providerMessageId,
    });
    return {
      application,
      quota: {
        ...quota,
        used: quota.used + 1,
        remaining: quota.remaining - 1,
      },
    };
  }
}
