'use client';

import { cn } from '@repo/ui/lib/utils';

import {
  APPLICATION_STATUSES,
  STATUS_META,
} from '@/components/applications-screen/application-status';
import { type ApplicationStatus } from '@/types/application.type';

interface ApplicationsOverviewProps {
  counts: Record<ApplicationStatus, number>;
  total: number;
}

/**
 * How the search is going: what came back from the applications sent, and
 * where they all stand.
 */
export function ApplicationsOverview({
  counts,
  total,
}: ApplicationsOverviewProps) {
  const heardBack = total - counts.SENT;
  const interviews = counts.INTERVIEW + counts.OFFER;
  const responseRate = total ? Math.round((heardBack / total) * 100) : 0;

  const metrics = [
    {
      label: 'Applications',
      value: String(total),
      caption: 'sent from CraftCV',
    },
    {
      label: 'Response rate',
      value: `${responseRate}%`,
      caption: `${heardBack} heard back`,
    },
    {
      label: 'Interviews',
      value: String(interviews),
      caption: 'reached interview or beyond',
    },
    {
      label: 'Offers',
      value: String(counts.OFFER),
      caption: counts.OFFER ? 'congratulations' : 'none yet',
      highlight: counts.OFFER > 0,
    },
  ];

  return (
    <section
      aria-label='Overview'
      className={`
        bg-card border-border/60 rounded-3xl border p-6 shadow-sm
        md:p-8
      `}
    >
      <dl
        className={`
          grid grid-cols-2 gap-x-6 gap-y-6
          md:grid-cols-4 md:divide-x
        `}
      >
        {metrics.map((metric) => (
          <div key={metric.label} className={`md:px-6 md:first:pl-0`}>
            <dt
              className={`
                text-muted-foreground text-xs font-semibold tracking-wider
                uppercase
              `}
            >
              {metric.label}
            </dt>
            <dd
              className={cn(
                `
                  font-display mt-2 text-3xl font-extrabold tracking-tight
                  tabular-nums
                  md:text-4xl
                `,
                metric.highlight && 'gradient-text',
              )}
            >
              {metric.value}
            </dd>
            <dd className='text-muted-foreground mt-1 text-xs'>
              {metric.caption}
            </dd>
          </div>
        ))}
      </dl>

      <div className='mt-8 border-t pt-6'>
        <div className='mb-3 flex items-center justify-between gap-4'>
          <h2 className='text-sm font-semibold'>Pipeline</h2>
          <span className='text-muted-foreground text-xs'>
            Where each application stands
          </span>
        </div>
        {/* One segment per status, as wide as its share */}
        <div
          role='img'
          aria-label={APPLICATION_STATUSES.map(
            (status) => `${STATUS_META[status].label}: ${counts[status]}`,
          ).join(', ')}
          className='bg-muted flex h-2.5 gap-0.5 overflow-hidden rounded-full'
        >
          {APPLICATION_STATUSES.filter((status) => counts[status]).map(
            (status) => (
              <span
                key={status}
                className={cn(
                  'h-full transition-[width] duration-500',
                  STATUS_META[status].fill,
                )}
                style={{ width: `${(counts[status] / total) * 100}%` }}
              />
            ),
          )}
        </div>
        <ul className='mt-4 flex flex-wrap gap-x-6 gap-y-2'>
          {APPLICATION_STATUSES.map((status) => (
            <li key={status} className='flex items-center gap-2 text-sm'>
              <span
                className={cn('size-2 rounded-full', STATUS_META[status].fill)}
              />
              <span className='text-muted-foreground'>
                {STATUS_META[status].label}
              </span>
              <span className='font-semibold tabular-nums'>
                {counts[status]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
