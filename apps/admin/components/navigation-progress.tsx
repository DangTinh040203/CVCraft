'use client';

import { cn } from '@repo/ui/lib/utils';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// Next's App Router only tells us a navigation *finished* (via the
// pathname change below) — there's no "navigation started" event like
// TanStack Router's `onBeforeLoad`. So we fake the start by watching
// clicks on same-origin links, the same trick libraries like NProgress
// use outside of a router-aware context.
export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const growTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;

      const anchor = (event.target as HTMLElement).closest('a');
      const href = anchor?.getAttribute('href');
      if (
        !anchor ||
        !href ||
        href.startsWith('#') ||
        anchor.target === '_blank' ||
        anchor.origin !== window.location.origin ||
        href === window.location.pathname
      ) {
        return;
      }

      clearTimeout(hideTimeout.current);
      setVisible(true);
      setProgress(20);
      growTimeout.current = setTimeout(() => setProgress(75), 250);
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!visible) return;

    clearTimeout(growTimeout.current);
    setProgress(100);
    hideTimeout.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 200);

    return () => clearTimeout(hideTimeout.current);
    // Only pathname changes should complete the bar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className='fixed inset-x-0 top-0 z-[100] h-0.5'>
      <div
        className={cn(
          `
            bg-primary h-full shadow-[0_0_8px_var(--color-primary)]
            transition-[width,opacity] duration-300 ease-out
          `,
          !visible && 'opacity-0',
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
