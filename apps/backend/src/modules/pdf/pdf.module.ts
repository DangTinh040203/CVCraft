import { Module } from '@nestjs/common';

import { PdfExportService } from '@/modules/pdf/application/services';
import { PdfController } from '@/modules/pdf/presentation/controllers';

@Module({
  providers: [PdfExportService],
  controllers: [PdfController],
})
export class PdfModule {}
