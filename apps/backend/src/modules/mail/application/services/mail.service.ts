import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from '@/libs/configs/env.config';
import {
  MAIL_PROVIDER_TOKEN,
  type MailMessage,
  type MailProvider,
} from '@/modules/mail/application/interfaces';
import {
  MailNotConfiguredError,
  MailQuotaExceededError,
  MailRejectedError,
} from '@/modules/mail/domain';

export type OutgoingMail = Omit<MailMessage, 'from' | 'html'> & {
  /** Shown as the sender's name; the address is always MAIL_FROM_ADDRESS. */
  fromName: string;
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Plain text as minimal HTML: one <p> per paragraph, <br> per line. */
export function textToHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => escapeHtml(paragraph.trim()).replace(/\n/g, '<br>'))
    .filter(Boolean)
    .map((paragraph) => `<p style="margin:0 0 14px">${paragraph}</p>`);
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1f2937">${paragraphs.join('')}</div>`;
}

/**
 * Sends mail through whichever MailProvider is bound, from our verified
 * address, and turns provider failures into API errors users can act on.
 */
@Injectable()
export class MailService {
  private readonly fromAddress: string | undefined;

  constructor(
    @Inject(MAIL_PROVIDER_TOKEN) private readonly provider: MailProvider,
    configService: ConfigService,
  ) {
    this.fromAddress = configService.get<string>(Env.MAIL_FROM_ADDRESS);
  }

  isConfigured(): boolean {
    return !!this.fromAddress && this.provider.isConfigured();
  }

  async send(mail: OutgoingMail): Promise<{ id: string }> {
    const { fromName, ...message } = mail;
    try {
      if (!this.fromAddress) throw new MailNotConfiguredError();
      // Quotes and angle brackets would break the "Name <address>" header
      const name = fromName.replace(/["<>\r\n]/g, '').trim();
      return await this.provider.send({
        ...message,
        from: name ? `"${name}" <${this.fromAddress}>` : this.fromAddress,
        html: textToHtml(message.text),
      });
    } catch (error) {
      if (error instanceof MailNotConfiguredError) {
        throw new ServiceUnavailableException(
          'Sending email is not available right now.',
          { cause: error },
        );
      }
      if (error instanceof MailQuotaExceededError) {
        throw new ServiceUnavailableException(
          "We've hit today's sending limit. Please try again tomorrow, or open the email in Gmail and send it yourself.",
          { cause: error },
        );
      }
      if (error instanceof MailRejectedError) {
        throw new BadRequestException(
          `The email couldn't be sent: ${error.message}`,
          { cause: error },
        );
      }
      throw error;
    }
  }
}
