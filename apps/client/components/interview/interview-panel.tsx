'use client';

import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { BrainCircuit, Mic, RotateCw, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { InterviewLive } from '@/components/interview/interview-live';
import { InterviewResult } from '@/components/interview/interview-result';
import { InterviewSetup } from '@/components/interview/interview-setup';
import { InterviewWaiting } from '@/components/interview/interview-waiting';
import { DEFAULT_INTERVIEW_SETTINGS } from '@/constants/interview.constant';
import { useService } from '@/hooks/use-http';
import { type UseInterview } from '@/hooks/use-interview';
import { JD_MAX_LENGTH, JD_MIN_LENGTH } from '@/hooks/use-job-match';
import { ResumeService } from '@/services/resume.service';
import {
  type InterviewPhase,
  type InterviewSettings,
} from '@/types/interview.type';
import { toastApiError } from '@/utils/toast-error-message.util';

/** One line under the title for each phase. */
export const INTERVIEW_DESCRIPTIONS: Record<InterviewPhase, string> = {
  setup: 'Practice out loud with an AI interviewer, then get scored feedback.',
  connecting: 'Getting your interviewer ready.',
  live: 'Answer out loud, as you would in a real interview.',
  evaluating: 'Reviewing your answers.',
  result: 'How you did, and what to practice next.',
};

interface InterviewPanelProps {
  interview: UseInterview;
  /** The interviewer also reads the editor's resume (the builder). */
  withResume: boolean;
  /** Shown to the user: the quota is refreshed each time it becomes so. */
  active: boolean;
  /** Prefills the job description (from a job match). */
  jobDescription?: string;
}

/**
 * The voice mock interview's content, wherever it's shown: set it up, talk,
 * read the feedback. A scrolling body and, for setup and result, a footer
 * with the start button.
 */
export function InterviewPanel({
  interview,
  withResume,
  active,
  jobDescription,
}: InterviewPanelProps) {
  const resumeService = useService(ResumeService);
  const [settings, setSettings] = useState<InterviewSettings>(
    DEFAULT_INTERVIEW_SETTINGS,
  );
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const { phase, refreshQuota } = interview;

  useEffect(() => {
    if (active) void refreshQuota();
  }, [active, refreshQuota]);

  // A job description handed over from the job match replaces the old one
  useEffect(() => {
    if (active && jobDescription && phase === 'setup') {
      setSettings((current) => ({ ...current, jobDescription }));
      setSourceFile(null);
    }
    // Only when it's handed over, not on every phase change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, jobDescription]);

  const updateSettings = (patch: Partial<InterviewSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
    if (patch.jobDescription !== undefined) setSourceFile(null);
  };

  const readPdf = async (file: File) => {
    setReading(true);
    try {
      const text = await resumeService.readJobDescription(file);
      setSettings((current) => ({
        ...current,
        jobDescription: text.slice(0, JD_MAX_LENGTH),
      }));
      setSourceFile(file.name);
    } catch (error) {
      toastApiError(error, "We couldn't read that PDF.");
    } finally {
      setReading(false);
    }
  };

  const { quota } = interview;
  const quotaLeft = quota?.remaining !== 0;
  const hasJobDescription =
    settings.jobDescription.trim().length >= JD_MIN_LENGTH;
  const canStart =
    interview.canStart && quotaLeft && hasJobDescription && !reading;
  // Under the start button: why it can't be pressed yet, or how many are left
  const startHint = !quotaLeft
    ? `You've used all ${quota?.limit} interviews for today. Try again tomorrow.`
    : !hasJobDescription
      ? 'Add the job description to start.'
      : quota
        ? `${quota.remaining} of ${quota.limit} interviews left today`
        : null;

  return (
    <>
      <div className='flex-1 overflow-y-auto px-6 py-6'>
        {phase === 'setup' && (
          <InterviewSetup
            settings={settings}
            onChange={updateSettings}
            onPdf={(file) => void readPdf(file)}
            reading={reading}
            sourceFile={sourceFile}
            error={interview.error}
            onDismissError={interview.dismissError}
            withResume={withResume}
          />
        )}
        {phase === 'connecting' && (
          <InterviewWaiting
            icon={Mic}
            title={`Connecting you with ${settings.voiceName}`}
            steps={[
              'Opening your microphone',
              withResume
                ? 'Reading your resume and the job'
                : 'Reading the job description',
              'Preparing the first question',
            ]}
            stepMs={1500}
            note='Allow microphone access if your browser asks.'
          />
        )}
        {phase === 'live' && (
          <InterviewLive
            interview={interview}
            interviewerName={settings.voiceName}
          />
        )}
        {phase === 'evaluating' && (
          <InterviewWaiting
            icon={BrainCircuit}
            title='Scoring your interview'
            steps={[
              'Reading the transcript',
              'Scoring each answer',
              'Writing your feedback',
            ]}
            stepMs={4000}
            note='This usually takes 10 to 30 seconds.'
          />
        )}
        {phase === 'result' && interview.feedback && (
          <InterviewResult
            feedback={interview.feedback}
            interviewerName={settings.voiceName}
          />
        )}
      </div>

      {(phase === 'setup' || phase === 'result') && (
        <div className='bg-background space-y-2 border-t px-6 py-4'>
          {phase === 'setup' ? (
            <Button
              variant='gradient'
              className='h-11 w-full gap-2'
              disabled={!canStart}
              aria-describedby={startHint ? 'start-hint' : undefined}
              onClick={() => void interview.start(settings)}
            >
              <Mic className='size-4' />
              Start interview
            </Button>
          ) : (
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='outline'
                className={`
                  hover:bg-muted hover:text-foreground
                  h-11 gap-2
                `}
                onClick={interview.reset}
              >
                <Settings2 className='size-4' />
                Change setup
              </Button>
              <Button
                variant='gradient'
                className='h-11 gap-2'
                disabled={!quotaLeft}
                aria-describedby={quotaLeft ? undefined : 'start-hint'}
                onClick={() => void interview.start(settings)}
              >
                <RotateCw className='size-4' />
                Practice again
              </Button>
            </div>
          )}
          {/* After a result, only the limit is worth a line */}
          {startHint && (phase === 'setup' || !quotaLeft) && (
            <p
              id='start-hint'
              className={cn(
                'text-center text-xs',
                quotaLeft ? 'text-muted-foreground' : 'text-destructive',
              )}
            >
              {startHint}
            </p>
          )}
        </div>
      )}
    </>
  );
}
