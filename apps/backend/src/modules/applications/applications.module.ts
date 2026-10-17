import { Module } from '@nestjs/common';

import { SENT_APPLICATION_REPOSITORY_TOKEN } from '@/modules/applications/application/interfaces';
import { ApplicationsService } from '@/modules/applications/application/services';
import { PrismaSentApplicationRepository } from '@/modules/applications/infrastructure/repositories';
import { ApplicationsController } from '@/modules/applications/presentation/controllers';
import { MailModule } from '@/modules/mail/mail.module';
import { PdfModule } from '@/modules/pdf/pdf.module';
import { UserModule } from '@/modules/user/user.module';

/** Job applications sent by email, and their history. */
@Module({
  imports: [MailModule, PdfModule, UserModule],
  providers: [
    ApplicationsService,
    {
      provide: SENT_APPLICATION_REPOSITORY_TOKEN,
      useClass: PrismaSentApplicationRepository,
    },
  ],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}
