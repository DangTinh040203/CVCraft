import { Body, Controller, Post, StreamableFile } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { PdfExportService } from '@/modules/pdf/application/services';
import { ExportPdfDto } from '@/modules/pdf/presentation/dtos';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfExportService: PdfExportService) {}

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('/export')
  async export(@Body() payload: ExportPdfDto): Promise<StreamableFile> {
    const pdf = await this.pdfExportService.render(payload);

    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: 'attachment; filename="resume.pdf"',
      length: pdf.length,
    });
  }
}
