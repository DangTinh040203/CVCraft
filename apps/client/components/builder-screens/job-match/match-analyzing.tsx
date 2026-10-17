'use client';

import { cn } from '@repo/ui/lib/utils';
import { m } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const STEPS = [
  'Reading the job description',
  'Comparing your skills',
  'Weighing your experience',
  'Writing suggestions',
];
/** A match takes ~10-20s; the last step waits for the real answer. */
const STEP_MS = 3500;

/** Shown while a match runs: progress through the steps, then a skeleton. */
export function MatchAnalyzing() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStep((current) => Math.min(current + 1, STEPS.length - 1)),
      STEP_MS,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className='space-y-8 py-2' aria-live='polite' aria-busy='true'>
      <div className='flex items-center gap-5'>
        <div className='relative size-[132px] shrink-0'>
          <div className='border-muted absolute inset-0 rounded-full border-10' />
          <m.div
            className={`
              border-t-primary absolute inset-0 rounded-full border-10
              border-transparent
            `}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <div className='flex-1 space-y-2.5'>
          <div className='bg-muted h-5 w-2/3 animate-pulse rounded-md' />
          <div className='bg-muted h-3 w-full animate-pulse rounded' />
          <div className='bg-muted h-3 w-5/6 animate-pulse rounded' />
        </div>
      </div>

      <ol className='space-y-3'>
        {STEPS.map((label, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li
              key={label}
              className={cn(
                'flex items-center gap-3 text-sm transition-colors',
                done || active ? 'text-foreground' : 'text-muted-foreground/60',
              )}
            >
              <span
                className={cn(
                  `
                    flex size-6 shrink-0 items-center justify-center
                    rounded-full border
                  `,
                  done && 'border-emerald-500 bg-emerald-500 text-white',
                  active && 'border-primary text-primary',
                )}
              >
                {done ? (
                  <Check className='size-3.5' />
                ) : active ? (
                  <Loader2 className='size-3.5 animate-spin' />
                ) : (
                  <span className='text-[10px]'>{index + 1}</span>
                )}
              </span>
              {label}
              {active && '…'}
            </li>
          );
        })}
      </ol>
      <p className='text-muted-foreground text-xs'>
        This usually takes 10 to 20 seconds.
      </p>
    </div>
  );
}
