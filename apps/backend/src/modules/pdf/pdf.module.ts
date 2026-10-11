import { Module } from '@nestjs/common';

import { PdfExportService } from '@/modules/pdf/application/services/pdf-export.service';
import { PdfController } from '@/modules/pdf/presentation/controllers/pdf.controller';

@Module({
  providers: [PdfExportService],
  controllers: [PdfController],
})
export class PdfModule {}
