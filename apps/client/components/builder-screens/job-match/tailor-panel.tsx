'use client';

import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  RotateCcw,
  RotateCw,
  Sparkles,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { useEffect } from 'react';

import {
  PLACEHOLDER,
  SuggestedLine,
} from '@/components/builder-screens/ai-rewrite-button';
import { sectionConfig } from '@/constants/builder-section.constant';
import { type useTailorResume } from '@/hooks/use-tailor-resume';
import { type TailorChange } from '@/types/match.type';

interface TailorPanelProps {
  tailor: ReturnType<typeof useTailorResume>;
  onBack: () => void;
  /** Back to the results, re-scoring the resume with the changes in. */
  onReanalyze: () => void;
}

/** The field before and after, the rewrite in the editor's list style. */
function ChangeText({
  change,
  lines,
  muted = false,
}: {
  change: TailorChange;
  lines: string[];
  muted?: boolean;
}) {
  const className = cn(
    'text-sm leading-relaxed',
    muted && 'text-muted-foreground',
  );
  if (change.kind === 'summary') {
    return (
      <p className={className}>
        {muted ? lines.join(' ') : <SuggestedLine line={lines.join(' ')} />}
      </p>
    );
  }
  return (
    <ul className={cn('list-disc space-y-1.5 pl-5', className)}>
      {lines.map((line) => (
        <li key={line}>{muted ? line : <SuggestedLine line={line} />}</li>
      ))}
    </ul>
  );
}

function ChangeCard({
  change,
  applied,
  available,
  onApply,
  onUndo,
}: {
  change: TailorChange;
  applied: boolean;
  available: boolean;
  onApply: () => void;
  onUndo: () => void;
}) {
  const section = sectionConfig.find(({ id }) => id === change.section);
  const SectionIcon = section?.icon ?? Sparkles;

  return (
    <li
      className={cn(
        'bg-card space-y-3 rounded-xl border p-4',
        applied && 'border-emerald-300 dark:border-emerald-500/40',
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p
            className={`
              text-muted-foreground flex items-center gap-1.5 text-xs
              font-medium
            `}
          >
            <SectionIcon className='size-3.5' />
            {section?.label}
          </p>
          <p className='truncate text-sm font-semibold'>{change.title}</p>
        </div>
        {applied ? (
          <Button
            type='button'
            variant='outline'
            size='sm'
            className={`
              hover:bg-muted hover:text-foreground
              h-8 shrink-0 gap-1.5
            `}
            onClick={onUndo}
          >
            <RotateCcw className='size-3.5' />
            Undo
          </Button>
        ) : (
          <Button
            type='button'
            variant='gradient'
            size='sm'
            className='h-8 shrink-0 gap-1.5'
            disabled={!available}
            title={
              available ? undefined : 'This entry is no longer in your resume'
            }
            onClick={onApply}
          >
            <Check className='size-3.5' />
            Apply
          </Button>
        )}
      </div>

      {change.reason && (
        <p className='text-muted-foreground text-xs leading-relaxed'>
          {change.reason}
        </p>
      )}

      <div
        className={cn(
          'rounded-lg p-3',
          applied
            ? 'bg-emerald-50 dark:bg-emerald-500/10'
            : 'bg-primary/5 dark:bg-primary/10',
        )}
      >
        <p
          className={cn(
            'mb-1.5 text-xs font-semibold',
            applied ? 'text-emerald-700 dark:text-emerald-300' : 'text-primary',
          )}
        >
          {applied ? 'Applied' : 'Suggested'}
        </p>
        <ChangeText change={change} lines={change.lines} />
      </div>

      <details className='group'>
        <summary
          className={`
            text-muted-foreground cursor-pointer text-xs font-medium select-none
            hover:text-foreground
          `}
        >
          Show original
        </summary>
        <div className='mt-2'>
          <ChangeText change={change} lines={change.original} muted />
        </div>
      </details>

      {change.keywords.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {change.keywords.map((keyword) => (
            <span
              key={keyword}
              className={`
                rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium
                text-emerald-700
                dark:bg-emerald-500/15 dark:text-emerald-300
              `}
            >
              + {keyword}
            </span>
          ))}
        </div>
      )}

      {change.unverified.length > 0 && (
        <div
          className={`
            flex gap-2 rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed
            text-amber-800
            dark:bg-amber-500/10 dark:text-amber-200
          `}
        >
          <TriangleAlert className='mt-0.5 size-3.5 shrink-0' />
          <p>
            <span className='font-semibold'>
              Not in your resume: {change.unverified.join(', ')}.
            </span>{' '}
            Apply only if it&apos;s true for this role, or edit it out after.
          </p>
        </div>
      )}
    </li>
  );
}

/**
 * The resume rewritten for the matched job: each change shown against the
 * original, applied (or undone) one by one, then re-analyzed to see the
 * score move. Nothing is saved until the user saves the resume.
 */
export function TailorPanel({ tailor, onBack, onReanalyze }: TailorPanelProps) {
  const { changes, loading, generate } = tailor;

  // Opening the panel the first time for this JD starts the rewrite
  useEffect(() => {
    if (!changes && !loading) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on open
  }, []);

  const pending =
    changes?.filter((c) => !tailor.isApplied(c) && tailor.isAvailable(c)) ?? [];
  const hasPlaceholders = changes?.some((c) =>
    c.lines.some((line) => PLACEHOLDER.test(line)),
  );

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex-1 space-y-5 overflow-y-auto px-6 py-6'>
        <div className='flex items-start justify-between gap-3'>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            AI rewrote the parts of your resume that matter most for this job,
            using only what your resume already says. Apply the ones you agree
            with.
          </p>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className={`
              hover:bg-muted hover:text-foreground
              h-8 shrink-0 gap-1.5
            `}
            disabled={loading}
            onClick={() => void generate()}
          >
            <RotateCw className={cn('size-3.5', loading && 'animate-spin')} />
            Try again
          </Button>
        </div>

        {loading || !changes ? (
          <div className='space-y-3' aria-label='Tailoring your resume'>
            <p className='text-muted-foreground text-xs'>
              Rewriting your resume for this job. This can take up to 30
              seconds.
            </p>
            {[0, 1, 2].map((index) => (
              <div key={index} className='space-y-2.5 rounded-xl border p-4'>
                <Skeleton className='h-4 w-1/3' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-11/12' />
                <Skeleton className='h-4 w-4/5' />
              </div>
            ))}
          </div>
        ) : changes.length === 0 ? (
          <div className='rounded-xl border border-dashed p-6 text-center'>
            <p className='text-sm font-medium'>Nothing to rewrite</p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Your summary and experience already fit this job. Add the missing
              keywords you can back up to your Skills instead.
            </p>
          </div>
        ) : (
          <>
            {hasPlaceholders && (
              <p className='text-muted-foreground text-xs leading-relaxed'>
                Replace the{' '}
                <mark
                  className={`
                    rounded bg-amber-100 px-0.5 text-amber-800
                    dark:bg-amber-500/20 dark:text-amber-200
                  `}
                >
                  [highlighted]
                </mark>{' '}
                parts with your real numbers, or remove them. Never claim
                results you can&apos;t back up.
              </p>
            )}
            <ul className='space-y-3'>
              {changes.map((change) => (
                <ChangeCard
                  key={change.ref}
                  change={change}
                  applied={tailor.isApplied(change)}
                  available={tailor.isAvailable(change)}
                  onApply={() => tailor.apply([change])}
                  onUndo={() => tailor.undo(change)}
                />
              ))}
            </ul>
            {tailor.appliedCount > 0 && (
              <p className='text-muted-foreground text-xs'>
                Applied {tailor.appliedCount} to the editor. Save your resume to
                keep them.
              </p>
            )}
          </>
        )}
      </div>

      <div className='bg-background space-y-2 border-t px-6 py-4'>
        {pending.length > 1 && (
          <Button
            variant='outline'
            className='h-9 w-full gap-1.5 text-sm'
            onClick={() => tailor.apply(pending)}
          >
            <CheckCheck className='size-3.5' />
            Apply all {pending.length}
          </Button>
        )}
        <div className='flex gap-2'>
          <Button
            variant='outline'
            className='h-11 flex-1 gap-2'
            onClick={onBack}
          >
            <ArrowLeft className='size-4' />
            Back to results
          </Button>
          <Button
            variant='gradient'
            className='h-11 flex-1 gap-2'
            disabled={loading || tailor.appliedCount === 0}
            onClick={onReanalyze}
          >
            <Target className='size-4' />
            Re-analyze match
          </Button>
        </div>
      </div>
    </div>
  );
}
