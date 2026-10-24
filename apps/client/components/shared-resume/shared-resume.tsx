'use client';

import { Button } from '@repo/ui/components/button';
import { ArrowRight, Printer } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { PagedResume } from '@/components/templates/paged-resume';
import { normalizeFormat } from '@/stores/features/template.slice';
import { type PublicResume } from '@/types/resume.type';
import { toResumeData } from '@/utils/resume.utils';

// A4 at 96dpi — the width every template renders at (w-[210mm])
const PAGE_WIDTH_PX = 794;
const PAGE_HEIGHT_PX = 1123;

// Printing gets the bare pages at full size, like the PDF export
const PRINT_CSS = `
  @page { size: 210mm 297mm; margin: 0; }
  @media print {
    html, body {
      overflow: visible !important;
      height: auto !important;
      background: #fff !important;
    }
    [data-shared-chrome] { display: none !important; }
    [data-shared-frame] { height: auto !important; padding: 0 !important; }
    [data-shared-page] { transform: none !important; box-shadow: none !important; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pagedjs_page:last-child { break-after: auto; }
  }
`;

/** The shared resume in its saved template, scaled to fit the screen. */
export function SharedResume({ resume }: { resume: PublicResume }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(PAGE_HEIGHT_PX);

  const format = useMemo(() => normalizeFormat(resume.format), [resume]);
  const resumeData = useMemo(
    () => toResumeData(resume, format),
    [resume, format],
  );

  // Never wider than the real page; narrower on phones
  useEffect(() => {
    const frame = frameRef.current;
    const page = pageRef.current;
    if (!frame || !page) return;

    const observer = new ResizeObserver(() => {
      setScale(Math.min(1, frame.clientWidth / PAGE_WIDTH_PX));
      setContentHeight(Math.max(page.scrollHeight, PAGE_HEIGHT_PX));
    });
    observer.observe(frame);
    observer.observe(page);
    return () => observer.disconnect();
  }, []);

  return (
    <div className='bg-muted/40 min-h-screen'>
      <style>{PRINT_CSS}</style>
      <header
        data-shared-chrome
        className='bg-background/90 sticky top-0 z-20 border-b backdrop-blur'
      >
        <div
          className={`
            mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3
          `}
        >
          <div className='min-w-0'>
            <p className='truncate font-semibold'>{resume.title || 'Resume'}</p>
            {resume.subTitle && (
              <p className='text-muted-foreground truncate text-xs'>
                {resume.subTitle}
              </p>
            )}
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className={`
                hover:bg-muted hover:text-foreground
                gap-1.5
              `}
              onClick={() => window.print()}
            >
              <Printer className='size-4' />
              <span
                className={`
                  hidden
                  sm:inline
                `}
              >
                Print / Save PDF
              </span>
            </Button>
            <Button variant='gradient' size='sm' className='gap-1.5' asChild>
              <Link href='/'>
                Made with CraftCV
                <ArrowRight className='size-3.5' />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-5xl px-4 py-6'>
        <div
          ref={frameRef}
          data-shared-frame
          className='mx-auto w-full'
          style={{ maxWidth: PAGE_WIDTH_PX, height: contentHeight * scale }}
        >
          <div
            ref={pageRef}
            data-shared-page
            className='origin-top-left text-left'
            style={{ width: PAGE_WIDTH_PX, transform: `scale(${scale})` }}
          >
            <PagedResume
              templateKey={resume.templateKey}
              resume={resumeData}
              format={format}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
