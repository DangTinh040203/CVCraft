'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@repo/ui/components/pagination';
import { cn } from '@repo/ui/lib/utils';
import { type MouseEvent } from 'react';

interface ApplicationsPaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  /** The URL of a page, so each number is a real link. */
  pageHref: (page: number) => string;
  onPage: (page: number) => void;
}

/**
 * The pages to number: the first, the last, and the current one with its
 * neighbours; a gap of one page is shown as that page rather than "…".
 */
export function pageItems(page: number, pageCount: number) {
  const pages = [...new Set([1, page - 1, page, page + 1, pageCount])]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  const items: Array<number | 'gap'> = [];
  pages.forEach((p, index) => {
    const previous = pages[index - 1];
    if (previous !== undefined && p - previous === 2) items.push(previous + 1);
    else if (previous !== undefined && p - previous > 2) items.push('gap');
    items.push(p);
  });
  return items;
}

// The theme's ghost hover is solid purple, stronger than the current page:
// keep hover light so the current page reads as the selected one
const HOVER = 'hover:bg-primary/10 hover:text-primary rounded-full';

export function ApplicationsPagination({
  page,
  pageCount,
  pageSize,
  total,
  pageHref,
  onPage,
}: ApplicationsPaginationProps) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Real links (open in a new tab, keyboard, crawlers); a plain click pages
  // in place
  const go = (target: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    if (target >= 1 && target <= pageCount && target !== page) onPage(target);
  };

  const edge = (disabled: boolean) =>
    cn(HOVER, disabled && 'pointer-events-none opacity-40');

  return (
    <div
      className={`
        mt-6 flex flex-col-reverse items-center justify-between gap-4
        sm:flex-row
      `}
    >
      <p className='text-muted-foreground text-sm'>
        Showing <span className='text-foreground font-medium'>{from}</span>–
        <span className='text-foreground font-medium'>{to}</span> of{' '}
        <span className='text-foreground font-medium'>{total}</span>{' '}
        applications
      </p>

      <Pagination className='mx-0 w-auto'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={pageHref(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
              className={edge(page <= 1)}
              onClick={go(page - 1)}
            />
          </PaginationItem>
          {pageItems(page, pageCount).map((item, index) =>
            item === 'gap' ? (
              <PaginationItem key={`gap-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href={pageHref(item)}
                  isActive={item === page}
                  className={cn(
                    HOVER,
                    'tabular-nums',
                    `
                      data-[active=true]:border-primary
                      data-[active=true]:bg-primary
                    `,
                    `
                      data-[active=true]:text-primary-foreground
                      data-[active=true]:shadow-sm
                    `,
                    'data-[active=true]:hover:bg-primary/90',
                  )}
                  onClick={go(item)}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href={pageHref(Math.min(pageCount, page + 1))}
              aria-disabled={page >= pageCount}
              tabIndex={page >= pageCount ? -1 : undefined}
              className={edge(page >= pageCount)}
              onClick={go(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
