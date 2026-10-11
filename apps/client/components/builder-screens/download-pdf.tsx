'use client';

import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/components/sonner';
import dayjs from 'dayjs';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import slugify from 'slugify';

import { useService } from '@/hooks/use-http';
import { PdfService } from '@/services/pdf.service';
import {
  templateFormatSelector,
  templateSelectedSelector,
} from '@/stores/features/template.slice';
import { useAppSelector } from '@/stores/store';
import { type Resume } from '@/types/resume.type';
import { toResumeData } from '@/utils/resume.utils';

interface DownloadPdfProps {
  resume: Resume;
}

/**
 * Exports exactly what the preview shows: the backend opens the same
 * template on the /print route in headless Chromium and prints it.
 */
const DownloadPdf: React.FC<DownloadPdfProps> = ({ resume }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const pdfService = useService(PdfService);

  const templateSelected = useAppSelector(templateSelectedSelector);
  const templateFormat = useAppSelector(templateFormatSelector);

  const handleDownload = async () => {
    if (!templateSelected) {
      toast.error('Please select a template first.');
      return;
    }

    setIsProcessing(true);
    try {
      const blob = await pdfService.exportPdf({
        templateKey: templateSelected,
        format: templateFormat,
        resume: toResumeData(resume, templateFormat),
      });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${slugify(`${resume.title} ${resume.subTitle}`)}-${dayjs(Date.now()).format('YYYY-MM-DD')}.pdf`;
      link.click();

      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Failed to generate the PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      disabled={isProcessing}
      onClick={handleDownload}
      variant='outline'
      className={`
        w-full shrink-0 gap-2 shadow-2xl
        sm:w-auto
      `}
    >
      {isProcessing ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <Download className='h-4 w-4' />
      )}
      Export PDF
    </Button>
  );
};

export default DownloadPdf;
