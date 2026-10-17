import { Module } from '@nestjs/common';

import { PdfExportService } from '@/modules/pdf/application/services';
import { PdfController } from '@/modules/pdf/presentation/controllers';

@Module({
  providers: [PdfExportService],
  controllers: [PdfController],
  // Applications attach the resume PDF to the emails they send
  exports: [PdfExportService],
})
export class PdfModule {}
