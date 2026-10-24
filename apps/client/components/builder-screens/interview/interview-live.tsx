'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog';
import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { Loader2, Mic, MicOff, Quote, Square } from 'lucide-react';

import { VoiceOrb } from '@/components/builder-screens/interview/voice-orb';
import { INTERVIEW_TIME_LIMIT_SECONDS } from '@/constants/interview.constant';
import { type UseInterview } from '@/hooks/use-interview';

/** 75 -> "01:15". */
export function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

interface InterviewLiveProps {
  interview: UseInterview;
  interviewerName: string;
}

/** The conversation: who has the floor, progress, what was asked. */
export function InterviewLive({
  interview,
  interviewerName,
}: InterviewLiveProps) {
  const { speaker, muted, progress, caption, elapsed, analysers, stopping } =
    interview;
  const candidateTurn = speaker === 'candidate';
  const remaining = INTERVIEW_TIME_LIMIT_SECONDS - elapsed;

  const status = !candidateTurn
    ? `${interviewerName} is speaking…`
    : muted
      ? 'Your microphone is muted'
      : 'Your turn: answer when you are ready';

  return (
    <div className='flex flex-col items-center gap-6 py-2'>
      <div className='flex w-full items-center justify-between text-sm'>
        <span className='font-semibold'>
          Question {progress.current}
          <span className='text-muted-foreground font-normal'>
            {' '}
            of {progress.total}
          </span>
        </span>
        <span
          className={cn(
            'text-muted-foreground font-mono tabular-nums',
            remaining <= 60 && 'text-destructive font-semibold',
          )}
          title='The interview ends automatically at the time limit'
        >
          {formatClock(elapsed)} / {formatClock(INTERVIEW_TIME_LIMIT_SECONDS)}
        </span>
      </div>

      <ol className='flex w-full gap-1.5' aria-hidden>
        {Array.from({ length: progress.total }, (_, index) => (
          <li
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-500',
              index < progress.current - 1
                ? 'bg-primary'
                : index === progress.current - 1
                  ? 'bg-primary/40'
                  : 'bg-muted',
            )}
          />
        ))}
      </ol>

      <VoiceOrb
        analyser={candidateTurn ? analysers.mic : analysers.interviewer}
        active={!(candidateTurn && muted)}
        tone={candidateTurn ? (muted ? 'idle' : 'candidate') : 'interviewer'}
      >
        {candidateTurn ? (
          muted ? (
            <MicOff className='size-10' />
          ) : (
            <Mic className='size-10' />
          )
        ) : (
          <span className='text-4xl font-bold'>{interviewerName[0]}</span>
        )}
      </VoiceOrb>

      <p
        className={cn(
          'text-center text-sm font-semibold',
          candidateTurn && !muted && 'text-emerald-600 dark:text-emerald-400',
        )}
        aria-live='polite'
      >
        {status}
      </p>

      <div
        className={`
          bg-muted/50 relative min-h-24 w-full rounded-xl border px-4 py-3.5
        `}
      >
        <Quote className='text-muted-foreground/40 absolute top-3 left-3 size-4' />
        <p className={`text-muted-foreground pl-6 text-sm leading-relaxed`}>
          {caption ?? `${interviewerName} is joining…`}
        </p>
      </div>

      <div className='grid w-full grid-cols-2 gap-3'>
        <Button
          variant='outline'
          className={cn(
            `
              hover:text-foreground
              h-11 gap-2
            `,
            muted
              ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10'
              : 'hover:bg-muted',
          )}
          aria-pressed={muted}
          onClick={interview.toggleMute}
        >
          {muted ? <MicOff className='size-4' /> : <Mic className='size-4' />}
          {muted ? 'Unmute' : 'Mute'}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='destructive'
              className='h-11 gap-2'
              disabled={stopping}
            >
              {stopping ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Square className='size-3.5 fill-current' />
              )}
              End interview
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End the interview now?</AlertDialogTitle>
              <AlertDialogDescription>
                The questions you&apos;ve answered so far will be scored. You
                can&apos;t continue this interview afterwards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep going</AlertDialogCancel>
              <AlertDialogAction onClick={interview.stop}>
                End and get feedback
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
