'use client';

import { useEffect, useState } from 'react';

import { type ResumeData } from '@/components/templates/resume.types';
import { ResumeDocument } from '@/components/templates/resume-document';
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

// One page rule for the exported PDF. Margins are 0 because every template
// already pads itself to A4; `clone` repeats that padding on later pages.
const PRINT_CSS = `
  @page { size: 210mm 297mm; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  [data-print-root] > div > * { box-decoration-break: clone; -webkit-box-decoration-break: clone; }
`;

export function PrintDocument() {
  const [data, setData] = useState<PrintData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(window[PRINT_DATA_KEY] ?? null);
  }, []);

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    // Signal the backend only after web fonts have laid out the text
    void document.fonts.ready.then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [data]);

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div data-print-root data-print-ready={ready ? 'true' : 'false'}>
        {data ? (
          <ResumeDocument
            templateKey={data.templateKey}
            resume={data.resume}
            format={data.format}
          />
        ) : null}
      </div>
    </>
  );
}
