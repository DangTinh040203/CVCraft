'use client';

import { Button } from '@repo/ui/components/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { Progress } from '@repo/ui/components/progress';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui/components/tooltip';
import { cn } from '@repo/ui/lib/utils';
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isThisYear,
  isToday,
  isYesterday,
} from 'date-fns';
import { m } from 'framer-motion';
import {
  ArrowRight,
  AtSign,
  Building2,
  ChevronRight,
  RotateCw,
  Search,
  SearchX,
  Send,
  StickyNote,
  WifiOff,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';

import { ApplicationDetailSheet } from '@/components/applications-screen/application-detail-sheet';
import {
  APPLICATION_STATUSES,
  STATUS_META,
} from '@/components/applications-screen/application-status';
import { ApplicationsOverview } from '@/components/applications-screen/applications-overview';
import { ApplicationsPagination } from '@/components/applications-screen/applications-pagination';
import { CompanyAvatar } from '@/components/applications-screen/company-avatar';
import { StatusSelect } from '@/components/applications-screen/status-select';
import { useApplications } from '@/hooks/use-applications';
import { fadeInUp, staggerContainer } from '@/styles/animation';
import {
  type ApplicationStatus,
  type SentApplication,
} from '@/types/application.type';

/** Opens the builder with the job match sheet, where applications start. */
const NEW_APPLICATION_HREF = '/builder?match=1';

/** The tab value for "every status" (tabs need a string). */
const ALL_TAB = 'ALL';

export function ApplicationsScreen() {
  const applications = useApplications();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Read from the list, so status and notes edits show in the sheet too
  const selected =
    applications.items.find((item) => item.id === selectedId) ?? null;

  const firstLoad = !applications.data && applications.loading;
  const empty = !!applications.data && applications.allCount === 0;

  let content: ReactNode;
  if (firstLoad) {
    content = <LoadingState />;
  } else if (applications.failed && !applications.data) {
    content = (
      <StateCard
        icon={<WifiOff className='size-6' />}
        title="Couldn't load your applications"
        description='Check your connection and try again.'
        action={
          <Button
            variant='outline'
            className='gap-2 rounded-full'
            onClick={() => void applications.reload()}
          >
            <RotateCw className='size-4' />
            Try again
          </Button>
        }
      />
    );
  } else if (empty) {
    content = <FirstApplication />;
  } else {
    content = (
      <m.div
        className='space-y-8'
        variants={staggerContainer}
        initial='hidden'
        animate='visible'
      >
        {applications.counts && (
          <m.div variants={fadeInUp}>
            <ApplicationsOverview
              counts={applications.counts}
              total={applications.allCount}
            />
          </m.div>
        )}

        <m.section
          id='applications-list'
          variants={fadeInUp}
          aria-label='Applications'
          className='scroll-mt-24'
        >
          <div
            className={`
              mb-4 flex flex-col gap-3
              lg:flex-row lg:items-center lg:justify-between
            `}
          >
            <StatusTabs
              counts={applications.counts}
              allCount={applications.allCount}
              active={applications.status}
              onSelect={applications.setStatus}
            />
            <SearchField
              value={applications.search}
              onChange={applications.setSearch}
            />
          </div>

          {applications.items.length ? (
            <ApplicationList
              items={applications.items}
              dimmed={applications.loading}
              onOpen={setSelectedId}
              onStatusChange={(application, status) =>
                void applications.update(application, { status })
              }
            />
          ) : (
            <StateCard
              icon={<SearchX className='size-6' />}
              title='No applications match'
              description='Try another search, or show every status.'
              action={
                <Button
                  variant='outline'
                  className='rounded-full'
                  onClick={() => {
                    applications.setSearch('');
                    applications.setStatus(undefined);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}

          {applications.total > applications.pageSize && (
            <ApplicationsPagination
              page={applications.page}
              pageCount={applications.pageCount}
              pageSize={applications.pageSize}
              total={applications.total}
              pageHref={applications.pageHref}
              onPage={(page) => {
                applications.setPage(page);
                document
                  .getElementById('applications-list')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}
        </m.section>
      </m.div>
    );
  }

  return (
    <section className='relative'>
      {/* The home page's backdrop: a soft brand wash with two glows */}
      <div
        aria-hidden
        className='absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden'
      >
        <div
          className={`
            from-primary/8 via-primary/3 absolute inset-0 bg-linear-to-b
            to-transparent
          `}
        />
        <div
          className={`
            bg-primary/10 absolute top-[-20%] right-[-8%] h-[220px] w-[220px]
            rounded-full blur-[80px]
            md:bg-primary/15 md:h-[460px] md:w-[460px] md:blur-[120px]
          `}
        />
        <div
          className={`
            bg-accent/10 absolute top-[5%] left-[-10%] h-[180px] w-[180px]
            rounded-full blur-[70px]
            md:h-[360px] md:w-[360px] md:blur-[100px]
          `}
        />
      </div>

      <div
        className={`
          container mx-auto max-w-6xl px-4 pt-28 pb-20
          md:px-6 md:pt-26
        `}
      >
        <Hero quota={applications.quota} />
        {content}
      </div>

      <ApplicationDetailSheet
        application={selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onUpdate={applications.update}
        onRemove={applications.remove}
      />
    </section>
  );
}

function Hero({
  quota,
}: {
  quota: ReturnType<typeof useApplications>['quota'];
}) {
  return (
    <m.header
      className={`
        mb-10 flex flex-col gap-8
        md:mb-12
        lg:flex-row lg:items-end lg:justify-between
      `}
      variants={staggerContainer}
      initial='hidden'
      animate='visible'
    >
      <div className='max-w-2xl'>
        <m.span
          variants={fadeInUp}
          className={`
            text-primary bg-primary/10 mb-5 inline-block rounded-full px-4
            py-1.5 text-xs font-semibold tracking-wider uppercase
          `}
        >
          Application tracker
        </m.span>
        <m.h1
          variants={fadeInUp}
          className={`
            font-display text-4xl leading-[1.1] font-extrabold tracking-tight
            md:text-5xl
          `}
        >
          My <span className='gradient-text'>applications</span>
        </m.h1>
        <m.p
          variants={fadeInUp}
          className={`
            text-muted-foreground mt-4 text-base leading-relaxed
            md:text-lg
          `}
        >
          Every job you applied to from CraftCV, with the email you sent. Move
          each one along as you hear back.
        </m.p>
      </div>

      <m.div
        variants={fadeInUp}
        className={`
          flex flex-col gap-4
          sm:flex-row sm:items-center
          lg:flex-col lg:items-end
        `}
      >
        <Button
          asChild
          variant='gradient'
          size='lg'
          className={`
            group shadow-primary/20 h-12 gap-2 rounded-full px-7 shadow-lg
          `}
        >
          <Link href={NEW_APPLICATION_HREF}>
            <Send className='size-4' />
            Apply for a job
            <ArrowRight
              className={`
                size-4 transition-transform
                group-hover:translate-x-0.5
              `}
            />
          </Link>
        </Button>
        {quota?.available && <QuotaMeter quota={quota} />}
      </m.div>
    </m.header>
  );
}

function QuotaMeter({
  quota,
}: {
  quota: NonNullable<ReturnType<typeof useApplications>['quota']>;
}) {
  const left = Math.max(0, Math.min(quota.remaining, quota.limit));
  return (
    <div
      className={`
        w-full
        sm:w-56
      `}
    >
      <div className='mb-1.5 flex items-baseline justify-between gap-3 text-xs'>
        <span className='text-muted-foreground'>Sends left today</span>
        <span className='font-semibold tabular-nums'>
          {quota.remaining} / {quota.limit}
        </span>
      </div>
      <Progress
        aria-label='Sends left today'
        value={(left / quota.limit) * 100}
        className={`
          bg-primary/10 h-1.5
          [&>[data-slot=progress-indicator]]:bg-(image:--gradient-primary)
        `}
      />
    </div>
  );
}

function StatusTabs({
  counts,
  allCount,
  active,
  onSelect,
}: {
  counts: ReturnType<typeof useApplications>['counts'];
  allCount: number;
  active: ApplicationStatus | undefined;
  onSelect: (status: ApplicationStatus | undefined) => void;
}) {
  const tabs = [
    { key: ALL_TAB, label: 'All', count: allCount },
    ...APPLICATION_STATUSES.map((status) => ({
      key: status,
      label: STATUS_META[status].label,
      count: counts?.[status] ?? 0,
    })),
  ];

  return (
    <Tabs
      value={active ?? ALL_TAB}
      onValueChange={(value) =>
        onSelect(value === ALL_TAB ? undefined : (value as ApplicationStatus))
      }
      // Scrolls sideways on small screens rather than wrapping
      className={`
        -mx-4 overflow-x-auto px-4
        lg:mx-0 lg:px-0
      `}
    >
      <TabsList
        aria-label='Filter by status'
        className='bg-muted/80 h-10 rounded-full p-1'
      >
        {tabs.map(({ key, label, count }) => (
          <TabsTrigger
            key={key}
            value={key}
            className={`
              group/tab rounded-full px-3.5
              data-[state=active]:bg-background
            `}
          >
            {label}
            <span
              className={`
                group-data-[state=active]/tab:text-primary
                group-data-[state=active]/tab:font-semibold
                group-data-[state=active]/tab:opacity-100
                text-xs tabular-nums opacity-60
              `}
            >
              {count}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <InputGroup
      className={`
        bg-background h-10 w-full rounded-full
        lg:w-80
      `}
    >
      <InputGroupAddon className='pl-3.5'>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        maxLength={100}
        placeholder='Search job, company or email'
        aria-label='Search applications'
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <InputGroupAddon align='inline-end'>
          <InputGroupButton
            size='icon-xs'
            aria-label='Clear search'
            className={`
              hover:bg-muted hover:text-foreground
              rounded-full
            `}
            onClick={() => onChange('')}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

/** "Today", "Yesterday", "This week", then month by month. */
function dateGroup(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (differenceInCalendarDays(new Date(), date) < 7) return 'This week';
  return format(date, isThisYear(date) ? 'MMMM' : 'MMMM yyyy');
}

function ApplicationList({
  items,
  dimmed,
  onOpen,
  onStatusChange,
}: {
  items: SentApplication[];
  dimmed: boolean;
  onOpen: (id: string) => void;
  onStatusChange: (
    application: SentApplication,
    status: ApplicationStatus,
  ) => void;
}) {
  // Newest first, so each group is a run of consecutive items
  const groups: Array<{ label: string; items: SentApplication[] }> = [];
  for (const item of items) {
    const label = dateGroup(item.createdAt);
    const last = groups.at(-1);
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }

  return (
    <div
      className={cn(
        `
          bg-card border-border/60 overflow-hidden rounded-3xl border shadow-sm
          transition-opacity
        `,
        dimmed && 'opacity-60',
      )}
    >
      {groups.map((group) => (
        <div key={group.label}>
          <h3
            className={`
              text-muted-foreground bg-muted/40 border-b px-5 py-2 text-xs
              font-semibold tracking-wider uppercase
              md:px-6
              [&:not(:first-child)]:border-t
            `}
          >
            {group.label}
          </h3>
          <ul aria-label='Applications' className='divide-y'>
            {group.items.map((application) => (
              <ApplicationRow
                key={application.id}
                application={application}
                onOpen={() => onOpen(application.id)}
                onStatusChange={(status) => onStatusChange(application, status)}
              />
            ))}
          </ul>
        </div>
      ))}
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
  onStatusChange: (status: ApplicationStatus) => void;
}) {
  const title = application.jobTitle || application.subject;
  const sentAt = new Date(application.createdAt);

  return (
    <li
      className={`
        group flex flex-wrap items-center gap-x-3 pr-4 transition-colors
        hover:bg-primary/3
        sm:flex-nowrap
        md:pr-6
      `}
    >
      <button
        type='button'
        className={`
          flex min-w-0 flex-1 basis-full items-center gap-4 py-4 pl-5 text-left
          focus-visible:outline-none
          sm:basis-auto
          md:pl-6
        `}
        onClick={onOpen}
      >
        <CompanyAvatar name={application.company || title} />
        <span className='min-w-0 flex-1'>
          <span
            className={`
              group-hover:text-primary
              block truncate font-semibold transition-colors
            `}
          >
            {title}
          </span>
          <span
            className={`
              text-muted-foreground mt-1 flex min-w-0 items-center gap-x-4
              text-sm
            `}
          >
            {application.company && (
              <span className='flex min-w-0 items-center gap-1.5'>
                <Building2 className='size-3.5 shrink-0' />
                <span className='truncate'>{application.company}</span>
              </span>
            )}
            <span
              className={cn(
                'min-w-0 items-center gap-1.5',
                application.company ? 'hidden sm:flex' : 'flex',
              )}
            >
              <AtSign className='size-3.5 shrink-0' />
              <span className='truncate'>{application.toEmail}</span>
            </span>
            {application.notes && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`
                      hidden shrink-0 items-center gap-1.5
                      md:flex
                    `}
                  >
                    <StickyNote className='size-3.5' />
                    Note
                  </span>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs whitespace-pre-line'>
                  {application.notes}
                </TooltipContent>
              </Tooltip>
            )}
          </span>
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <time
              dateTime={application.createdAt}
              className={`
                text-muted-foreground hidden w-28 shrink-0 text-right text-sm
                md:block
              `}
            >
              {formatDistanceToNowStrict(sentAt, { addSuffix: true })}
            </time>
          </TooltipTrigger>
          <TooltipContent>
            {format(sentAt, 'EEEE, MMM d, yyyy · HH:mm')}
          </TooltipContent>
        </Tooltip>
      </button>
      {/* Under the text on phones, so the title keeps the full width */}
      <StatusSelect
        value={application.status}
        onChange={onStatusChange}
        className={`
          -mt-2 mb-4 ml-20
          sm:m-0
        `}
      />
      <ChevronRight
        aria-hidden
        className={`
          text-muted-foreground hidden size-4 shrink-0 transition-transform
          group-hover:translate-x-0.5
          md:block
        `}
      />
    </li>
  );
}

function StateCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div
      className={`
        bg-card border-border/60 flex flex-col items-center rounded-3xl border
        px-6 py-14 text-center shadow-sm
      `}
    >
      <span
        className={`
          bg-primary/10 text-primary mb-4 flex size-12 items-center
          justify-center rounded-2xl
        `}
      >
        {icon}
      </span>
      <h3 className='font-display text-lg font-bold'>{title}</h3>
      <p className='text-muted-foreground mt-1 mb-6 max-w-sm text-sm'>
        {description}
      </p>
      {action}
    </div>
  );
}

const FIRST_STEPS = [
  {
    title: 'Match a job',
    text: 'Paste the job description and see how your resume scores.',
  },
  {
    title: 'Let AI write the email',
    text: 'A tailored email, addressed to whoever the posting names.',
  },
  {
    title: 'Send and track',
    text: 'It goes out with your resume attached, and lands here.',
  },
];

/** The empty list: how applications get here, and the way to start. */
function FirstApplication() {
  return (
    <m.div
      initial='hidden'
      animate='visible'
      variants={fadeInUp}
      className={`
        bg-card border-border/60 relative overflow-hidden rounded-3xl border
        px-6 py-12 text-center shadow-sm
        md:px-12 md:py-16
      `}
    >
      <span
        className={`
          gradient-bg shadow-glow mx-auto mb-6 flex size-14 items-center
          justify-center rounded-2xl text-white
        `}
      >
        <Send className='size-6' />
      </span>
      <h2
        className={`
          font-display text-2xl font-extrabold tracking-tight
          md:text-3xl
        `}
      >
        No applications yet
      </h2>
      <p className='text-muted-foreground mx-auto mt-3 max-w-lg'>
        Apply straight from your resume. Every email you send from CraftCV is
        kept here, so you can follow up and see what&apos;s working.
      </p>

      <ol
        className={`
          mx-auto mt-10 grid max-w-3xl gap-4 text-left
          md:grid-cols-3
        `}
      >
        {FIRST_STEPS.map((step, index) => (
          <li key={step.title} className='bg-muted/40 rounded-2xl border p-5'>
            <span
              className={`
                text-primary font-display text-sm font-bold tabular-nums
              `}
            >
              0{index + 1}
            </span>
            <p className='mt-2 font-semibold'>{step.title}</p>
            <p className='text-muted-foreground mt-1 text-sm'>{step.text}</p>
          </li>
        ))}
      </ol>

      <Button
        asChild
        variant='gradient'
        size='lg'
        className={`
          shadow-primary/20 mt-10 h-12 gap-2 rounded-full px-8 shadow-lg
        `}
      >
        <Link href={NEW_APPLICATION_HREF}>
          Apply for your first job
          <ArrowRight className='size-4' />
        </Link>
      </Button>
    </m.div>
  );
}

function LoadingState() {
  return (
    <div aria-busy className='space-y-8'>
      <Skeleton className='h-[248px] rounded-3xl' />
      <div className='flex justify-between gap-4'>
        <Skeleton className='h-10 w-96 rounded-full' />
        <Skeleton
          className={`
            hidden h-10 w-80 rounded-full
            lg:block
          `}
        />
      </div>
      <div className='divide-y overflow-hidden rounded-3xl border'>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className='flex items-center gap-4 px-6 py-4'>
            <Skeleton className='size-11 rounded-xl' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-1/3' />
              <Skeleton className='h-3 w-1/2' />
            </div>
            <Skeleton className='h-7 w-28 rounded-full' />
          </div>
        ))}
      </div>
    </div>
  );
}
