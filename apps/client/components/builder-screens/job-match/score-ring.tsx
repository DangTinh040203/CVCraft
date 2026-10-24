'use client';

import { cn } from '@repo/ui/lib/utils';
import { m } from 'framer-motion';

import {
  type MatchBand,
  matchBand,
} from '@/components/builder-screens/job-match/match-band';
import CountUp from '@/components/common/count-up';

const SIZE = 132;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The overall score as a ring that fills up, colored by its band. */
export function ScoreRing({
  score,
  label = 'Match score',
  band = matchBand(score),
}: {
  score: number;
  /** Read by screen readers before the score. */
  label?: string;
  /** Colors for a scale other than the match score's. */
  band?: MatchBand;
}) {
  return (
    <div
      className='relative shrink-0'
      style={{ width: SIZE, height: SIZE }}
      role='img'
      aria-label={`${label} ${score} out of 100`}
    >
      <svg width={SIZE} height={SIZE} className='-rotate-90'>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill='none'
          strokeWidth={STROKE}
          className='stroke-muted'
        />
        <m.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill='none'
          strokeWidth={STROKE}
          strokeLinecap='round'
          stroke='currentColor'
          className={band.text}
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - score / 100) }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center`}
      >
        <span className='text-4xl font-bold tracking-tight tabular-nums'>
          <CountUp to={score} duration={1.1} />
        </span>
        <span className='text-muted-foreground text-xs font-medium'>
          out of 100
        </span>
      </div>
    </div>
  );
}

/**
 * Scores of an unchanged resume can still differ by a point or two between
 * runs; a change that small reads as "about the same", not as edits that
 * hurt.
 */
const NOISE = 2;

/** "+6 since last check" next to a re-analyzed score. */
export function ScoreDelta({
  score,
  previous,
}: {
  score: number;
  previous: number | null;
}) {
  if (previous === null) return null;
  const delta = score - previous;
  const trend = Math.abs(delta) <= NOISE ? 'same' : delta > 0 ? 'up' : 'down';
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-semibold',
        trend === 'up' &&
          `
            bg-emerald-50 text-emerald-700
            dark:bg-emerald-500/15 dark:text-emerald-300
          `,
        trend === 'down' &&
          'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
        trend === 'same' && 'bg-muted text-muted-foreground',
      )}
    >
      {trend === 'same'
        ? 'About the same as last check'
        : `${delta > 0 ? '+' : ''}${delta} since last check`}
    </span>
  );
}
