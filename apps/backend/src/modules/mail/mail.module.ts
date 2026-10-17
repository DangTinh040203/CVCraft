import { Module } from '@nestjs/common';

import { MAIL_PROVIDER_TOKEN } from '@/modules/mail/application/interfaces';
import { MailService } from '@/modules/mail/application/services';
import { ResendAdapter } from '@/modules/mail/infrastructure/adapters';

/**
 * Outgoing email. The vendor is chosen here and nowhere else: to switch,
 * add an adapter implementing MailProvider and bind it below.
 */
@Module({
  providers: [
    MailService,
    {
      provide: MAIL_PROVIDER_TOKEN,
      useClass: ResendAdapter,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
