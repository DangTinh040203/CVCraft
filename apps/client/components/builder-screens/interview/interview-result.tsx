'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';
import { cn } from '@repo/ui/lib/utils';
import { m } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  type LucideIcon,
  MessageSquareText,
  MicOff,
  ScrollText,
  Target,
  TrendingUp,
} from 'lucide-react';
import { type ReactNode } from 'react';

import { formatClock } from '@/components/builder-screens/interview/interview-live';
import { matchBand } from '@/components/builder-screens/job-match/match-band';
import { ScoreRing } from '@/components/builder-screens/job-match/score-ring';
import {
  type InterviewFeedback,
  type InterviewVerdict,
} from '@/types/interview.type';

/**
 * Colors on the interview's own scale (the verdict's 70 / 50 thresholds),
 * not the match score's, so a score and its verdict never disagree.
 */
function interviewBand(score: number) {
  return matchBand(score >= 70 ? 100 : score >= 50 ? 50 : 0);
}

const VERDICTS: Record<InterviewVerdict, { label: string; badge: string }> = {
  PASS: {
    label: 'Ready to pass',
    badge: `
      bg-emerald-50 text-emerald-700
      dark:bg-emerald-500/15 dark:text-emerald-300
    `,
  },
  BORDERLINE: {
    label: 'Borderline',
    badge: `
      bg-amber-50 text-amber-700
      dark:bg-amber-500/15 dark:text-amber-300
    `,
  },
  FAIL: {
    label: 'Needs more practice',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
};

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

/** The evaluation: score and verdict, breakdown, each answer, transcript. */
export function InterviewResult({
  feedback,
  interviewerName,
}: {
  feedback: InterviewFeedback;
  interviewerName: string;
}) {
  const verdict = VERDICTS[feedback.verdict];

  // Ended before any answer: no score to show, rather than a failing one
  if (feedback.questionsAnswered === 0) {
    return (
      <div className='flex flex-col items-center py-12 text-center'>
        <div
          className={`
            bg-muted text-muted-foreground mb-4 flex size-14 items-center
            justify-center rounded-2xl
          `}
        >
          <MicOff className='size-7' />
        </div>
        <h3 className='font-semibold'>No answers to score yet</h3>
        <p
          className={`
            text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed
          `}
        >
          The interview ended before you answered a question. Practice again
          when you&apos;re ready; it only takes a few minutes.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <section
        className={`
          flex flex-col items-center gap-5 text-center
          sm:flex-row sm:text-left
        `}
      >
        <ScoreRing
          score={feedback.overallScore}
          label='Interview score'
          band={interviewBand(feedback.overallScore)}
        />
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
                verdict.badge,
              )}
            >
              {verdict.label}
            </span>
            <span
              className={`text-muted-foreground flex items-center gap-1 text-xs`}
            >
              <MessageSquareText className='size-3.5' />
              {feedback.questionsAnswered}/{feedback.totalQuestions} answered
            </span>
            <span
              className={`text-muted-foreground flex items-center gap-1 text-xs`}
            >
              <Clock className='size-3.5' />
              {formatClock(feedback.durationSeconds)}
            </span>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {feedback.summary}
          </p>
        </div>
      </section>

      {feedback.questions.length > 0 && (
        <>
          <Block
            icon={TrendingUp}
            title='Score breakdown'
            aside={
              <span className='text-muted-foreground text-xs'>
                Weight · score
              </span>
            }
          >
            <ul className='space-y-4'>
              {feedback.criteria.map((criterion, index) => {
                const band = interviewBand(criterion.score);
                return (
                  <li key={criterion.key}>
                    <div
                      className={`
                        flex items-baseline justify-between gap-3 text-sm
                      `}
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
                        className={cn('font-semibold tabular-nums', band.text)}
                      >
                        {criterion.score}
                      </span>
                    </div>
                    <div
                      className={`
                        bg-muted mt-1.5 h-2 overflow-hidden rounded-full
                      `}
                    >
                      <m.div
                        className={cn('h-full rounded-full', band.bar)}
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

          <Block icon={MessageSquareText} title='Your answers'>
            <Accordion type='multiple' className='rounded-xl border'>
              {feedback.questions.map((question) => {
                const band = interviewBand(question.score);
                return (
                  <AccordionItem
                    key={question.questionNumber}
                    value={String(question.questionNumber)}
                    className='px-4'
                  >
                    <AccordionTrigger
                      className={`
                        gap-3
                        hover:no-underline
                      `}
                    >
                      <span className='flex min-w-0 items-start gap-3'>
                        <span
                          className={cn(
                            `
                              flex size-8 shrink-0 items-center justify-center
                              rounded-full text-xs font-bold text-white
                            `,
                            band.bar,
                          )}
                        >
                          {question.score}
                        </span>
                        <span className='text-sm leading-snug font-medium'>
                          <span className='text-muted-foreground'>
                            Q{question.questionNumber}.{' '}
                          </span>
                          {question.question}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className={`
                      space-y-3
                      sm:pl-11
                    `}>
                      {question.feedback && (
                        <p className='text-muted-foreground leading-relaxed'>
                          {question.feedback}
                        </p>
                      )}
                      {question.suggestion && (
                        <div className='bg-primary/5 rounded-lg p-3'>
                          <p
                            className={`text-primary mb-1 text-xs font-semibold`}
                          >
                            A stronger answer
                          </p>
                          <p className='leading-relaxed'>
                            {question.suggestion}
                          </p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Block>
        </>
      )}

      {feedback.strengths.length > 0 && (
        <Block icon={CheckCircle2} title='What went well'>
          <ul className='space-y-2.5'>
            {feedback.strengths.map((strength) => (
              <li
                key={strength}
                className='flex gap-2.5 text-sm leading-relaxed'
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

      {feedback.improvements.length > 0 && (
        <Block icon={Target} title='What to practice'>
          <ol className='space-y-2.5'>
            {feedback.improvements.map((improvement, index) => (
              <li
                key={improvement}
                className='bg-card flex gap-3 rounded-xl border p-3.5'
              >
                <span
                  className={`
                    bg-primary/10 text-primary flex size-6 shrink-0 items-center
                    justify-center rounded-full text-xs font-semibold
                  `}
                >
                  {index + 1}
                </span>
                <p className='text-sm leading-relaxed'>{improvement}</p>
              </li>
            ))}
          </ol>
        </Block>
      )}

      {feedback.transcript.length > 0 && (
        <Accordion type='single' collapsible className='rounded-xl border'>
          <AccordionItem value='transcript' className='px-4'>
            <AccordionTrigger className='hover:no-underline'>
              <span className='flex items-center gap-2 text-sm font-semibold'>
                <ScrollText className='text-muted-foreground size-4' />
                Transcript
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ol className='space-y-3'>
                {feedback.transcript.map((turn, index) => (
                  <li key={index} className='text-sm leading-relaxed'>
                    <span
                      className={cn(
                        'mr-1.5 text-xs font-semibold',
                        turn.role === 'interviewer'
                          ? 'text-primary'
                          : 'text-emerald-600 dark:text-emerald-400',
                      )}
                    >
                      {turn.role === 'interviewer' ? interviewerName : 'You'}
                    </span>
                    {turn.content}
                  </li>
                ))}
              </ol>
              <p className='text-muted-foreground mt-3 text-xs'>
                Transcribed from speech, so small mistakes are likely.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
