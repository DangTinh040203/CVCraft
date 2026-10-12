'use client';

import { useEffect, useState } from 'react';

import { PagedResume } from '@/components/templates/paged-resume';
import { type ResumeData } from '@/components/templates/resume.types';
import { type Format } from '@/stores/features/template.slice';

/** Must match PRINT_DATA_KEY in apps/backend's PdfExportService. */
const PRINT_DATA_KEY = '__CRAFTCV_PRINT__';

interface PrintData {
  templateKey: string;
  format?: Partial<Format> | null;
  resume: ResumeData;
}

declare global {
  interface Window {
    [PRINT_DATA_KEY]?: PrintData;
  }
}

// Paged.js has already cut the resume into A4 pages (the same ones the builder
// previews); each prints as one sheet with no extra margin.
const PRINT_CSS = `
  @page { size: 210mm 297mm; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  /* Paged.js caps body at one page tall; with the root layout's overflow-x
     clipping that makes it a scroller and only page 1 would print */
  @media print {
    html, body {
      overflow: visible !important;
      height: auto !important;
      max-height: none !important;
    }
    .pagedjs_page:last-child { break-after: auto; }
  }
`;

export function PrintDocument() {
  const [data, setData] = useState<PrintData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(window[PRINT_DATA_KEY] ?? null);
  }, []);

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div data-print-root data-print-ready={ready ? 'true' : 'false'}>
        {data ? (
          <PagedResume
            templateKey={data.templateKey}
            resume={data.resume}
            format={data.format}
            // Signals the backend that the pages are laid out
            onRendered={() => setReady(true)}
          />
        ) : null}
      </div>
    </>
  );
}
