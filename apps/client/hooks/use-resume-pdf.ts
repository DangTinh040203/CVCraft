import { toast } from '@repo/ui/components/sonner';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import slugify from 'slugify';

import { useService } from '@/hooks/use-http';
import { type ExportPdfPayload, PdfService } from '@/services/pdf.service';
import { resumeSelector } from '@/stores/features/resume.slice';
import {
  templateFormatSelector,
  templateSelectedSelector,
} from '@/stores/features/template.slice';
import { useAppSelector } from '@/stores/store';
import { toResumeData } from '@/utils/resume.utils';

/**
 * The resume as the preview shows it (template, format, unsaved edits),
 * ready for the backend to print: downloaded by Export PDF, attached by
 * application emails.
 */
export function useResumePdf() {
  const { resume } = useAppSelector(resumeSelector);
  const templateKey = useAppSelector(templateSelectedSelector);
  const format = useAppSelector(templateFormatSelector);
  const pdfService = useService(PdfService);
  const [isDownloading, setIsDownloading] = useState(false);

  const payload = useCallback((): ExportPdfPayload | null => {
    if (!resume || !templateKey) return null;
    return { templateKey, format, resume: toResumeData(resume, format) };
  }, [format, resume, templateKey]);

  const fileName = resume
    ? `${slugify(`${resume.title} ${resume.subTitle}`)}-${dayjs().format('YYYY-MM-DD')}.pdf`
    : 'resume.pdf';

  const download = useCallback(async () => {
    const body = payload();
    if (!body) {
      toast.error('Please select a template first.');
      return;
    }
    setIsDownloading(true);
    try {
      const blob = await pdfService.exportPdf(body);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to generate the PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [fileName, payload, pdfService]);

  return { payload, download, isDownloading };
}
