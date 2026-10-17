'use client';

import { cn } from '@repo/ui/lib/utils';
import { m } from 'framer-motion';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  type LucideIcon,
  Plus,
  Sparkles,
  Tags,
  TrendingUp,
} from 'lucide-react';
import { type ReactNode } from 'react';

import { matchBand } from '@/components/builder-screens/job-match/match-band';
import {
  ScoreDelta,
  ScoreRing,
} from '@/components/builder-screens/job-match/score-ring';
import { sectionConfig } from '@/constants/builder-section.constant';
import { type MatchResult, type MatchSuggestion } from '@/types/match.type';

interface MatchResultViewProps {
  result: MatchResult;
  previousScore: number | null;
  /** Missing keywords the user added to their skills this session. */
  addedKeywords: Set<string>;
  onAddKeyword: (keyword: string) => void;
  onGoToSection: (section: MatchSuggestion['section']) => void;
}

function Block({
  icon: Icon,
  title,
  aside,
  children,
}: {
  icon: LucideIcon;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <h3 className='flex items-center gap-2 text-sm font-semibold'>
          <Icon className='text-muted-foreground size-4' />
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** A match's score, breakdown, keywords and what to change, in that order. */
export function MatchResultView({
  result,
  previousScore,
  addedKeywords,
  onAddKeyword,
  onGoToSection,
}: MatchResultViewProps) {
  const band = matchBand(result.overallScore);

  return (
    <div className='space-y-8'>
      <section
        className={`
          flex flex-col items-center gap-5 text-center
          sm:flex-row sm:items-center sm:text-left
        `}
      >
        <ScoreRing score={result.overallScore} />
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
          {result.jobTitle && (
            <p className='leading-snug font-semibold'>
              {result.jobTitle}
              {result.company && (
                <span className='text-muted-foreground font-normal'>
                  {' '}
                  · {result.company}
                </span>
              )}
            </p>
          )}
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {result.summary}
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
            const criterionBand = matchBand(criterion.score);
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
                      criterionBand.text,
                    )}
                  >
                    {criterion.score}
                  </span>
                </div>
                <div
                  className={`bg-muted mt-1.5 h-2 overflow-hidden rounded-full`}
                >
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
                </div>
                {criterion.explanation && (
                  <p
                    className={`
                      text-muted-foreground mt-1.5 text-xs leading-relaxed
                    `}
                  >
                    {criterion.explanation}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Block>

      <Block icon={Tags} title='Keywords'>
        <div className='space-y-4'>
          <div>
            <p className='text-muted-foreground mb-2 text-xs font-medium'>
              Missing from your resume ({result.missingKeywords.length})
            </p>
            {result.missingKeywords.length > 0 ? (
              <div className='flex flex-wrap gap-1.5'>
                {result.missingKeywords.map((keyword) => {
                  const added = addedKeywords.has(keyword);
                  return (
                    <button
                      key={keyword}
                      type='button'
                      disabled={added}
                      onClick={() => onAddKeyword(keyword)}
                      title={added ? 'Added to Skills' : 'Add to Skills'}
                      className={cn(
                        `
                          inline-flex items-center gap-1 rounded-full border
                          px-2.5 py-1 text-xs font-medium transition-colors
                        `,
                        added
                          ? `
                            border-emerald-200 bg-emerald-50 text-emerald-700
                            dark:border-emerald-500/30 dark:bg-emerald-500/15
                            dark:text-emerald-300
                          `
                          : `
                            cursor-pointer border-dashed border-rose-300
                            text-rose-700
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
            ) : (
              <p className='text-sm'>None. Your resume covers the key terms.</p>
            )}
            {result.missingKeywords.length > 0 && (
              <p className='text-muted-foreground mt-2 text-xs'>
                {addedKeywords.size > 0
                  ? `Added ${addedKeywords.size} to Skills. Save your resume to keep them.`
                  : 'Click one to add it to your Skills. Only add what you can back up in an interview.'}
              </p>
            )}
          </div>

          {result.matchedKeywords.length > 0 && (
            <div>
              <p className='text-muted-foreground mb-2 text-xs font-medium'>
                Already in your resume ({result.matchedKeywords.length})
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {result.matchedKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className={`
                      inline-flex items-center gap-1 rounded-full bg-emerald-50
                      px-2.5 py-1 text-xs font-medium text-emerald-700
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

      {result.strengths.length > 0 && (
        <Block icon={CheckCircle2} title="What's working">
          <ul className='space-y-2.5'>
            {result.strengths.map((strength) => (
              <li
                key={strength}
                className={`flex gap-2.5 text-sm leading-relaxed`}
              >
                <CheckCircle2
                  className={`mt-0.5 size-4 shrink-0 text-emerald-500`}
                />
                {strength}
              </li>
            ))}
          </ul>
        </Block>
      )}

      {result.suggestions.length > 0 && (
        <Block icon={Sparkles} title='How to improve'>
          <ol className='space-y-2.5'>
            {result.suggestions.map((suggestion, index) => {
              const section = sectionConfig.find(
                ({ id }) => id === suggestion.section,
              );
              return (
                <li
                  key={suggestion.text}
                  className='bg-card flex gap-3 rounded-xl border p-3.5'
                >
                  <span
                    className={`
                      bg-primary/10 text-primary flex size-6 shrink-0
                      items-center justify-center rounded-full text-xs
                      font-semibold
                    `}
                  >
                    {index + 1}
                  </span>
                  <div className='min-w-0 flex-1 space-y-2'>
                    <p className='text-sm leading-relaxed'>{suggestion.text}</p>
                    {section && (
                      <button
                        type='button'
                        onClick={() => onGoToSection(suggestion.section)}
                        className={`
                          text-primary inline-flex cursor-pointer items-center
                          gap-1 text-xs font-semibold
                          hover:underline
                        `}
                      >
                        <section.icon className='size-3.5' />
                        Edit {section.label}
                        <ArrowRight className='size-3' />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Block>
      )}
    </div>
  );
}
