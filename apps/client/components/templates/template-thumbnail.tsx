'use client';

import { type ReactNode,useEffect, useRef, useState } from 'react';

// A4 at 96dpi (1mm = 96/25.4px) — matches the `w-[210mm]` root every
// template renders at, per the @page rule convention in
// planning/3-pdf-mvp-reference.md.
const PAGE_WIDTH_PX = 794;
const PAGE_HEIGHT_PX = 1123;

/**
 * Renders the actual template component at real size, then scales it down
 * with CSS to fit whatever width the parent card gives it — a live
 * preview, not a screenshot, so it never drifts from the real template.
 */
export function TemplateThumbnail({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setScale(entry.contentRect.width / PAGE_WIDTH_PX);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className='relative w-full overflow-hidden bg-white'
      style={{ aspectRatio: `${PAGE_WIDTH_PX} / ${PAGE_HEIGHT_PX}` }}
    >
      <div
        className='absolute top-0 left-0 origin-top-left'
        style={{ width: PAGE_WIDTH_PX, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
