'use client';

import { Button } from '@repo/ui/components/button';
import { Download, Loader2 } from 'lucide-react';

import { useResumePdf } from '@/hooks/use-resume-pdf';

/**
 * Exports exactly what the preview shows: the backend opens the same
 * template on the /print route in headless Chromium and prints it.
 */
const DownloadPdf = () => {
  const { download, isDownloading } = useResumePdf();

  return (
    <Button
      disabled={isDownloading}
      onClick={() => void download()}
      variant='outline'
      className={`
        w-full shrink-0 gap-2 shadow-2xl
        lg:w-auto
      `}
    >
      {isDownloading ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <Download className='h-4 w-4' />
      )}
      Export PDF
    </Button>
  );
};

export default DownloadPdf;
