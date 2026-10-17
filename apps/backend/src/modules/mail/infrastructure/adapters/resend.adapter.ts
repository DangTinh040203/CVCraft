import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { Env } from '@/libs/configs/env.config';
import {
  type MailMessage,
  type MailProvider,
} from '@/modules/mail/application/interfaces';
import {
  MailNotConfiguredError,
  MailQuotaExceededError,
  MailRejectedError,
} from '@/modules/mail/domain';

/** Resend error names that mean "used up for now", not "bad message". */
const QUOTA_ERRORS = new Set([
  'daily_quota_exceeded',
  'monthly_quota_exceeded',
  'rate_limit_exceeded',
]);
/** ...and the ones that mean the message itself was refused. */
const REJECTED_ERRORS = new Set([
  'validation_error',
  'invalid_from_address',
  'invalid_attachment',
  'invalid_parameter',
  'missing_required_field',
]);

@Injectable()
export class ResendAdapter implements MailProvider {
  private readonly client: Resend | null;

  constructor(configService: ConfigService) {
    const apiKey = configService.get<string>(Env.RESEND_API_KEY);
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async send(message: MailMessage): Promise<{ id: string }> {
    if (!this.client) throw new MailNotConfiguredError();

    // The SDK reports API errors in its result rather than throwing
    const { data, error } = await this.client.emails.send({
      from: message.from,
      to: message.to,
      cc: message.cc,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    if (error) {
      if (QUOTA_ERRORS.has(error.name)) {
        throw new MailQuotaExceededError(error.message, error);
      }
      if (REJECTED_ERRORS.has(error.name)) {
        throw new MailRejectedError(error.message, error);
      }
      // Credentials, outages: a server fault, logged by the exception filter
      throw new Error(`Resend: ${error.name}: ${error.message}`);
    }
    if (!data?.id) throw new Error('Resend returned no message id');
    return { id: data.id };
  }
}
