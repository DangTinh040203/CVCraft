'use client';

import { Button } from '@repo/ui/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui/components/empty';
import { Input } from '@repo/ui/components/input';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  Layers,
  RotateCw,
  Search,
  SearchX,
  Send,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { ApplicationDetailSheet } from '@/components/applications-screen/application-detail-sheet';
import {
  APPLICATION_STATUSES,
  STATUS_META,
} from '@/components/applications-screen/application-status';
import { CompanyAvatar } from '@/components/applications-screen/company-avatar';
import { StatusSelect } from '@/components/applications-screen/status-select';
import { useApplications } from '@/hooks/use-applications';
import { type SentApplication } from '@/types/application.type';

/** Opens the builder with the job match sheet, where applications start. */
const NEW_APPLICATION_HREF = '/builder?match=1';

export function ApplicationsScreen() {
  const applications = useApplications();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Read from the list, so status and notes edits show in the sheet too
  const selected =
    applications.items.find((item) => item.id === selectedId) ?? null;

  const firstLoad = !applications.data && applications.loading;
  const empty = !!applications.data && applications.allCount === 0;

  return (
    <section
      className={`
        container mx-auto max-w-5xl px-4 pt-24 pb-16
        md:px-6 md:pt-28
      `}
    >
      <header
        className={`
          mb-8 flex flex-col gap-4
          sm:flex-row sm:items-end sm:justify-between
        `}
      >
        <div>
          <h1
            className={`
              font-display text-2xl font-extrabold tracking-tight
              md:text-3xl
            `}
          >
            My applications
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Every job you applied to from CraftCV. Track where each one stands.
          </p>
        </div>
        <div className={`
          flex flex-col items-start gap-1.5
          sm:items-end
        `}>
          <Button asChild variant='gradient' className='gap-2'>
            <Link href={NEW_APPLICATION_HREF}>
              <Send className='size-4' />
              Apply for a job
            </Link>
          </Button>
          {applications.quota?.available && (
            <span className='text-muted-foreground text-xs'>
              {applications.quota.remaining} of {applications.quota.limit} sends
              left in the last 24 hours
            </span>
          )}
        </div>
      </header>

      {firstLoad ? (
        <LoadingState />
      ) : applications.failed && !applications.data ? (
        <Empty className='border'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>Couldn&apos;t load your applications</EmptyTitle>
            <EmptyDescription>
              Check your connection and try again.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant='outline'
              className='gap-2'
              onClick={() => void applications.reload()}
            >
              <RotateCw className='size-4' />
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      ) : empty ? (
        <Empty className='border border-dashed'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Send />
            </EmptyMedia>
            <EmptyTitle>No applications yet</EmptyTitle>
            <EmptyDescription>
              Match your resume to a job description, let AI write the email,
              and send it with your resume attached. It shows up here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant='gradient' className='gap-2'>
              <Link href={NEW_APPLICATION_HREF}>
                <Send className='size-4' />
                Apply for your first job
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <StatusOverview
            counts={applications.counts}
            allCount={applications.allCount}
            active={applications.status}
            onSelect={applications.setStatus}
          />

          <div className='relative mt-6 mb-3'>
            <Search
              className={`
                text-muted-foreground pointer-events-none absolute top-1/2
                left-3 size-4 -translate-y-1/2
              `}
            />
            <Input
              value={applications.search}
              maxLength={100}
              placeholder='Search by job, company or recruiter email'
              aria-label='Search applications'
              className='h-10 pr-9 pl-9'
              onChange={(event) => applications.setSearch(event.target.value)}
            />
            {applications.search && (
              <button
                type='button'
                aria-label='Clear search'
                className={`
                  text-muted-foreground absolute top-1/2 right-2
                  -translate-y-1/2 rounded-md p-1
                  hover:bg-muted
                `}
                onClick={() => applications.setSearch('')}
              >
                <X className='size-4' />
              </button>
            )}
          </div>

          {applications.items.length ? (
            <ul
              aria-label='Applications'
              className={cn(
                'bg-card divide-y overflow-hidden rounded-xl border',
                'transition-opacity',
                applications.loading && 'opacity-60',
              )}
            >
              {applications.items.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  onOpen={() => setSelectedId(application.id)}
                  onStatusChange={(status) =>
                    void applications.update(application, { status })
                  }
                />
              ))}
            </ul>
          ) : (
            <Empty className='border'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>No applications match</EmptyTitle>
                <EmptyDescription>
                  Try another search, or show every status.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant='outline'
                  onClick={() => {
                    applications.setSearch('');
                    applications.setStatus(undefined);
                  }}
                >
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          )}

          {applications.total > applications.pageSize && (
            <Pagination
              page={applications.page}
              pageCount={applications.pageCount}
              pageSize={applications.pageSize}
              total={applications.total}
              onPage={applications.setPage}
            />
          )}
        </>
      )}

      <ApplicationDetailSheet
        application={selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onUpdate={applications.update}
        onRemove={applications.remove}
      />
    </section>
  );
}

function StatusOverview({
  counts,
  allCount,
  active,
  onSelect,
}: {
  counts: ReturnType<typeof useApplications>['counts'];
  allCount: number;
  active: SentApplication['status'] | undefined;
  onSelect: (status: SentApplication['status'] | undefined) => void;
}) {
  const tiles = [
    { key: undefined, label: 'All', icon: Layers, count: allCount, dot: '' },
    ...APPLICATION_STATUSES.map((status) => ({
      key: status,
      label: STATUS_META[status].label,
      icon: STATUS_META[status].icon,
      count: counts?.[status] ?? 0,
      dot: STATUS_META[status].dot,
    })),
  ];

  return (
    <div
      role='tablist'
      aria-label='Filter by status'
      className={`
        grid grid-cols-3 gap-2
        md:grid-cols-6
      `}
    >
      {tiles.map(({ key, label, icon: Icon, count, dot }) => {
        const selected = active === key;
        return (
          <button
            key={label}
            type='button'
            role='tab'
            aria-selected={selected}
            className={cn(
              `
                bg-card flex flex-col items-start gap-1 rounded-xl border p-3
                text-left transition-colors
                hover:border-primary/40
              `,
              selected && 'border-primary ring-primary/20 bg-primary/5 ring-2',
            )}
            onClick={() => onSelect(key)}
          >
            <span
              className={`
                text-muted-foreground flex items-center gap-1.5 text-xs
                font-medium
              `}
            >
              {dot ? (
                <span className={cn('size-1.5 rounded-full', dot)} />
              ) : (
                <Icon className='size-3.5' />
              )}
              {label}
            </span>
            <span className='text-xl font-bold tabular-nums'>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function ApplicationRow({
  application,
  onOpen,
  onStatusChange,
}: {
  application: SentApplication;
  onOpen: () => void;
  onStatusChange: (status: SentApplication['status']) => void;
}) {
  const title = application.jobTitle || application.subject;
  const sentAt = new Date(application.createdAt);

  return (
    <li
      className={`
        hover:bg-muted/40
        flex items-center gap-3 px-4 py-3 transition-colors
      `}
    >
      <button
        type='button'
        className='flex min-w-0 flex-1 items-center gap-3 text-left'
        onClick={onOpen}
      >
        <CompanyAvatar name={application.company || title} />
        <span className='min-w-0 flex-1'>
          <span className='block truncate text-sm font-semibold'>{title}</span>
          <span className='text-muted-foreground block truncate text-xs'>
            {[application.company, application.toEmail]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </span>
        <time
          dateTime={application.createdAt}
          title={sentAt.toLocaleString()}
          className={`
            text-muted-foreground hidden shrink-0 text-xs
            sm:block
          `}
        >
          {formatDistanceToNowStrict(sentAt, { addSuffix: true })}
        </time>
      </button>
      <StatusSelect value={application.status} onChange={onStatusChange} />
    </li>
  );
}

function Pagination({
  page,
  pageCount,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <nav
      aria-label='Pages'
      className='mt-4 flex items-center justify-between gap-3'
    >
      <span className='text-muted-foreground text-sm'>
        {from}–{to} of {total}
      </span>
      <div className='flex items-center gap-1'>
        <Button
          variant='outline'
          size='icon'
          aria-label='Previous page'
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className='size-4' />
        </Button>
        <span className='px-2 text-sm tabular-nums'>
          {page} / {pageCount}
        </span>
        <Button
          variant='outline'
          size='icon'
          aria-label='Next page'
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight className='size-4' />
        </Button>
      </div>
    </nav>
  );
}

function LoadingState() {
  return (
    <div aria-busy className='space-y-6'>
      <div
        className={`
          grid grid-cols-3 gap-2
          md:grid-cols-6
        `}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className='h-[68px] rounded-xl' />
        ))}
      </div>
      <Skeleton className='h-10 rounded-md' />
      <div className='divide-y rounded-xl border'>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className='flex items-center gap-3 px-4 py-3'>
            <Skeleton className='size-10 rounded-lg' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-3.5 w-1/2' />
              <Skeleton className='h-3 w-1/3' />
            </div>
            <Skeleton className='h-8 w-24 rounded-full' />
          </div>
        ))}
      </div>
    </div>
  );
}
