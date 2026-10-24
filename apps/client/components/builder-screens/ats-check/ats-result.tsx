'use client';

import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { m } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  type LucideIcon,
  Plus,
  Tags,
  TrendingUp,
  XCircle,
} from 'lucide-react';

import {
  type MatchBand,
  matchBand,
} from '@/components/builder-screens/job-match/match-band';
import { Block } from '@/components/builder-screens/job-match/match-result';
import {
  ScoreDelta,
  ScoreRing,
} from '@/components/builder-screens/job-match/score-ring';
import { sectionConfig } from '@/constants/builder-section.constant';
import {
  type AtsIssue,
  type AtsResult,
  type AtsSeverity,
} from '@/types/ats.type';

const VERDICTS = [
  { min: 80, label: 'ATS-ready' },
  { min: 65, label: 'Good' },
  { min: 45, label: 'Needs work' },
  { min: 0, label: 'Poor' },
];

/** The match score's colors, with verdicts that fit an ATS check. */
function atsBand(score: number): MatchBand {
  const verdict = VERDICTS.find((v) => score >= v.min) ?? VERDICTS.at(-1)!;
  return { ...matchBand(score), label: verdict.label };
}

const SEVERITY: Record<
  AtsSeverity,
  { icon: LucideIcon; label: string; className: string }
> = {
  critical: {
    icon: XCircle,
    label: 'Fix',
    className: 'text-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Improve',
    className: 'text-amber-500',
  },
  tip: {
    icon: Lightbulb,
    label: 'Tip',
    className: 'text-sky-500',
  },
};

function IssueItem({
  issue,
  onGoToSection,
}: {
  issue: AtsIssue;
  onGoToSection: (section: AtsIssue['section']) => void;
}) {
  const severity = SEVERITY[issue.severity];
  const section = sectionConfig.find(({ id }) => id === issue.section);
  return (
    <li className='bg-card flex gap-3 rounded-xl border p-3.5'>
      <severity.icon
        className={cn('mt-0.5 size-4 shrink-0', severity.className)}
        aria-label={severity.label}
      />
      <div className='min-w-0 flex-1 space-y-2'>
        <p className='text-sm leading-relaxed'>{issue.message}</p>
        {issue.examples && issue.examples.length > 0 && (
          <ul className='space-y-1'>
            {issue.examples.map((example) => (
              <li
                key={example}
                className={`
                  text-muted-foreground border-muted border-l-2 pl-2.5 text-xs
                  leading-relaxed
                `}
              >
                {example}
              </li>
            ))}
          </ul>
        )}
        {section && (
          <Button
            type='button'
            variant='link'
            size='sm'
            className='h-auto gap-1 p-0 text-xs font-semibold'
            onClick={() => onGoToSection(issue.section)}
          >
            <section.icon className='size-3.5' />
            Edit {section.label}
            <ArrowRight className='size-3' />
          </Button>
        )}
      </div>
    </li>
  );
}

interface AtsResultViewProps {
  result: AtsResult;
  previousScore: number | null;
  /** Missing keywords the user added to their skills this session. */
  addedKeywords: Set<string>;
  onAddKeyword: (keyword: string) => void;
  onGoToSection: (section: AtsIssue['section']) => void;
}

/** An ATS check's score, breakdown, what to fix, then keywords. */
export function AtsResultView({
  result,
  previousScore,
  addedKeywords,
  onAddKeyword,
  onGoToSection,
}: AtsResultViewProps) {
  const band = atsBand(result.overallScore);
  const { stats, keywords } = result;

  return (
    <div className='space-y-8'>
      <section
        className={`
          flex flex-col items-center gap-5 text-center
          sm:flex-row sm:items-center sm:text-left
        `}
      >
        <ScoreRing score={result.overallScore} label='ATS score' band={band} />
        <div className='min-w-0 flex-1 space-y-2'>
          <div
            className={`
              flex flex-wrap items-center justify-center gap-2
              sm:justify-start
            `}
          >
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                band.badge,
              )}
            >
              {band.label}
            </span>
            <ScoreDelta score={result.overallScore} previous={previousScore} />
          </div>
          {keywords?.targetRole && (
            <p className='leading-snug font-semibold'>
              <span className='text-muted-foreground font-normal'>
                Checked as{' '}
              </span>
              {keywords.targetRole}
            </p>
          )}
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {stats.words} words · {stats.bulletsWithNumbers} of {stats.bullets}{' '}
            bullets with a number ·{' '}
            {result.issues.length === 0
              ? 'nothing to fix'
              : `${result.issues.length} thing${result.issues.length > 1 ? 's' : ''} to improve`}
          </p>
        </div>
      </section>

      <Block
        icon={TrendingUp}
        title='Score breakdown'
        aside={
          <span className='text-muted-foreground text-xs'>Weight · score</span>
        }
      >
        <ul className='space-y-4'>
          {result.criteria.map((criterion, index) => {
            const criterionBand =
              criterion.score === null ? null : matchBand(criterion.score);
            return (
              <li key={criterion.key}>
                <div
                  className={`flex items-baseline justify-between gap-3 text-sm`}
                >
                  <span className='font-medium'>
                    {criterion.name}
                    <span
                      className={`
                        text-muted-foreground ml-1.5 text-xs font-normal
                      `}
                    >
                      {criterion.weight}%
                    </span>
                  </span>
                  <span
                    className={cn(
                      'font-semibold tabular-nums',
                      criterionBand?.text ?? 'text-muted-foreground',
                    )}
                  >
                    {criterion.score ?? '–'}
                  </span>
                </div>
                <div
                  className={`bg-muted mt-1.5 h-2 overflow-hidden rounded-full`}
                >
                  {criterionBand && (
                    <m.div
                      className={cn('h-full rounded-full', criterionBand.bar)}
                      initial={{ width: 0 }}
                      animate={{ width: `${criterion.score}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.15 + index * 0.08,
                        ease: 'easeOut',
                      }}
                    />
                  )}
                </div>
                <p
                  className={`
                    text-muted-foreground mt-1.5 text-xs leading-relaxed
                  `}
                >
                  {criterion.summary}
                </p>
              </li>
            );
          })}
        </ul>
      </Block>

      <Block icon={ListChecks} title='What to fix'>
        {result.issues.length > 0 ? (
          <ol className='space-y-2.5'>
            {result.issues.map((issue) => (
              <IssueItem
                key={`${issue.section}:${issue.message}`}
                issue={issue}
                onGoToSection={onGoToSection}
              />
            ))}
          </ol>
        ) : (
          <p className='flex items-center gap-2 text-sm'>
            <CheckCircle2 className='size-4 text-emerald-500' />
            No issues found. Your resume reads well to an ATS.
          </p>
        )}
      </Block>

      {keywords && keywords.present.length + keywords.missing.length > 0 && (
        <Block icon={Tags} title='Keywords for this role'>
          <div className='space-y-4'>
            {keywords.missing.length > 0 && (
              <div>
                <p className='text-muted-foreground mb-2 text-xs font-medium'>
                  Commonly searched, not in your resume (
                  {keywords.missing.length})
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {keywords.missing.map((keyword) => {
                    const added = addedKeywords.has(keyword);
                    return (
                      <button
                        key={keyword}
                        type='button'
                        aria-disabled={added}
                        title={added ? 'Added to Skills' : 'Add to Skills'}
                        onClick={() => !added && onAddKeyword(keyword)}
                        className={cn(
                          `
                            inline-flex items-center gap-1 rounded-full border
                            px-2.5 py-1 text-xs font-medium
                          `,
                          added
                            ? `
                              border-emerald-200 bg-emerald-50 text-emerald-700
                              dark:border-emerald-500/30 dark:bg-emerald-500/15
                              dark:text-emerald-300
                            `
                            : `
                              border-dashed border-rose-300 text-rose-700
                              hover:bg-rose-50
                              dark:border-rose-500/40 dark:text-rose-300
                              dark:hover:bg-rose-500/10
                            `,
                        )}
                      >
                        {added ? (
                          <Check className='size-3' />
                        ) : (
                          <Plus className='size-3' />
                        )}
                        {keyword}
                      </button>
                    );
                  })}
                </div>
                <p className='text-muted-foreground mt-2 text-xs'>
                  {addedKeywords.size > 0
                    ? `Added ${addedKeywords.size} to Skills. Save your resume to keep them.`
                    : 'Click one to add it to your Skills. Only add what you can back up in an interview.'}
                </p>
              </div>
            )}
            {keywords.present.length > 0 && (
              <div>
                <p className='text-muted-foreground mb-2 text-xs font-medium'>
                  Already in your resume ({keywords.present.length})
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {keywords.present.map((keyword) => (
                    <span
                      key={keyword}
                      className={`
                        inline-flex items-center gap-1 rounded-full
                        bg-emerald-50 px-2.5 py-1 text-xs font-medium
                        text-emerald-700
                        dark:bg-emerald-500/15 dark:text-emerald-300
                      `}
                    >
                      <Check className='size-3' />
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Block>
      )}
    </div>
  );
}
