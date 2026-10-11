import { type ResumeData } from '@/components/templates/resume.types';
import { HttpService, type HttpServiceOptions } from '@/services/http.service';
import { type Format } from '@/stores/features/template.slice';

export interface ExportPdfPayload {
  templateKey: string;
  format: Format;
  resume: ResumeData;
}

export class PdfService extends HttpService {
  constructor(options?: HttpServiceOptions) {
    super(options);
  }

  /** Server renders the same template through headless Chromium. */
  async exportPdf(payload: ExportPdfPayload): Promise<Blob> {
    const { data } = await this.post<ExportPdfPayload, Blob>(
      '/pdf/export',
      payload,
      { responseType: 'blob' },
    );
    return data;
  }
}
