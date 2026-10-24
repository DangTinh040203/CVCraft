'use client';

import { cn } from '@repo/ui/lib/utils';
import { m } from 'framer-motion';
import { Check, Loader2, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InterviewWaitingProps {
  icon: LucideIcon;
  title: string;
  steps: string[];
  /** Time per step; the last one waits for the real answer. */
  stepMs: number;
  note?: string;
}

/** While the interview connects or is scored: steps that tick along. */
export function InterviewWaiting({
  icon: Icon,
  title,
  steps,
  stepMs,
  note,
}: InterviewWaitingProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStep((current) => Math.min(current + 1, steps.length - 1)),
      stepMs,
    );
    return () => clearInterval(timer);
  }, [steps.length, stepMs]);

  return (
    <div
      className='flex flex-col items-center gap-8 py-8'
      aria-live='polite'
      aria-busy='true'
    >
      <div className='relative flex size-28 items-center justify-center'>
        <m.div
          className='bg-primary/15 absolute inset-0 rounded-full'
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.3, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className={`
            from-primary to-primary/70 relative flex size-20 items-center
            justify-center rounded-full bg-linear-to-br shadow-lg
          `}
        >
          <Icon className='text-primary-foreground size-9' />
        </div>
      </div>

      <h3 className='text-lg font-semibold'>{title}</h3>

      <ol className='w-full max-w-xs space-y-3'>
        {steps.map((label, index) => {
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
      {note && <p className='text-muted-foreground text-xs'>{note}</p>}
    </div>
  );
}
