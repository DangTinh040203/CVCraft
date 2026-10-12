'use client';

import { Button } from '@repo/ui/components/button';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { PagedResume } from '@/components/templates/paged-resume';
import { useSyncResume } from '@/hooks/use-sync-resume';
import {
  templateConfigSelector,
  templateFormatSelector,
  templateSelectedSelector,
  updatePreviewMode,
} from '@/stores/features/template.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { toResumeData } from '@/utils/resume.utils';

// A4 at 96dpi — the width every template renders at (w-[210mm])
const PAGE_WIDTH_PX = 794;
const PAGE_HEIGHT_PX = 1123;

const TemplatePreview = () => {
  const templateSelected = useAppSelector(templateSelectedSelector);
  const templateFormat = useAppSelector(templateFormatSelector);
  const { resume } = useSyncResume();
  const { previewMode } = useAppSelector(templateConfigSelector);
  const dispatch = useAppDispatch();

  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [contentHeight, setContentHeight] = useState(PAGE_HEIGHT_PX);

  const resumeData = useMemo(
    () => (resume ? toResumeData(resume, templateFormat) : null),
    [resume, templateFormat],
  );

  // Fit the real-size page to the column width, and let long resumes scroll
  useEffect(() => {
    const frame = frameRef.current;
    const page = pageRef.current;
    if (!frame || !page) return;

    const observer = new ResizeObserver(() => {
      setScale(frame.clientWidth / PAGE_WIDTH_PX);
      setContentHeight(Math.max(page.scrollHeight, PAGE_HEIGHT_PX));
    });
    observer.observe(frame);
    observer.observe(page);
    return () => observer.disconnect();
  }, [resumeData]);

  if (!templateSelected || !resumeData) return null;

  return (
    <div className='sticky top-20 z-10 flex flex-col items-center gap-4'>
      <div
        ref={frameRef}
        className={`
          bg-muted relative z-10 w-full scrollbar-none overflow-hidden
          overflow-y-auto rounded-lg border shadow-xl select-none
        `}
        style={{ aspectRatio: `${PAGE_WIDTH_PX} / ${PAGE_HEIGHT_PX}` }}
      >
        <div style={{ height: contentHeight * scale }}>
          <div
            ref={pageRef}
            className='origin-top-left text-left'
            style={{ width: PAGE_WIDTH_PX, transform: `scale(${scale})` }}
          >
            <PagedResume
              templateKey={templateSelected}
              resume={resumeData}
              format={templateFormat}
            />
          </div>
        </div>
      </div>

      <Button
        className='rounded-full px-6'
        onClick={() => dispatch(updatePreviewMode(!previewMode))}
      >
        {!previewMode ? 'Preview' : 'Back to Edit'}
      </Button>
    </div>
  );
};

export default TemplatePreview;
