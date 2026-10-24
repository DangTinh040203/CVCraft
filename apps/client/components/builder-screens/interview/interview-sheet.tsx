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
} from '@repo/ui/components/alert-dialog';
import { Button } from '@repo/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { cn } from '@repo/ui/lib/utils';
import { BrainCircuit, Mic, RotateCw, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { InterviewLive } from '@/components/builder-screens/interview/interview-live';
import { InterviewResult } from '@/components/builder-screens/interview/interview-result';
import { InterviewSetup } from '@/components/builder-screens/interview/interview-setup';
import { InterviewWaiting } from '@/components/builder-screens/interview/interview-waiting';
import { DEFAULT_INTERVIEW_SETTINGS } from '@/constants/interview.constant';
import { useService } from '@/hooks/use-http';
import { useInterview } from '@/hooks/use-interview';
import { JD_MAX_LENGTH, JD_MIN_LENGTH } from '@/hooks/use-job-match';
import { ResumeService } from '@/services/resume.service';
import { type InterviewSettings } from '@/types/interview.type';
import { toastApiError } from '@/utils/toast-error-message.util';

const DESCRIPTIONS = {
  setup: 'Practice out loud with an AI interviewer, then get scored feedback.',
  connecting: 'Getting your interviewer ready.',
  live: 'Answer out loud, as you would in a real interview.',
  evaluating: 'Reviewing your answers.',
  result: 'How you did, and what to practice next.',
} as const;

interface InterviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefills the job description (from a job match). */
  jobDescription?: string;
}

/**
 * The voice mock interview in a side panel: set it up, talk, read the
 * feedback. Closing it mid-interview asks first, then abandons it.
 */
export function InterviewSheet({
  open,
  onOpenChange,
  jobDescription,
}: InterviewSheetProps) {
  const interview = useInterview();
  const resumeService = useService(ResumeService);
  const [settings, setSettings] = useState<InterviewSettings>(
    DEFAULT_INTERVIEW_SETTINGS,
  );
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const { phase, refreshQuota } = interview;
  const busy =
    phase === 'connecting' || phase === 'live' || phase === 'evaluating';

  useEffect(() => {
    if (open) void refreshQuota();
  }, [open, refreshQuota]);

  // A job description handed over from the job match replaces the old one
  useEffect(() => {
    if (open && jobDescription && phase === 'setup') {
      setSettings((current) => ({ ...current, jobDescription }));
      setSourceFile(null);
    }
    // Only when it's handed over, not on every phase change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, jobDescription]);

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

  const handleOpenChange = (next: boolean) => {
    if (!next && busy) {
      setConfirmLeave(true);
      return;
    }
    if (!next && phase === 'result') interview.reset();
    onOpenChange(next);
  };

  const leave = () => {
    interview.cancel();
    setConfirmLeave(false);
    onOpenChange(false);
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
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          className={`
            w-full gap-0 p-0
            sm:max-w-xl
          `}
        >
          <SheetHeader className='border-b px-6 pt-6 pb-5'>
            <div className='flex items-center gap-3 pr-6'>
              <div
                className={`
                  from-primary to-primary/70 flex size-10 shrink-0 items-center
                  justify-center rounded-xl bg-linear-to-br shadow-sm
                `}
              >
                <Mic className='text-primary-foreground size-5' />
              </div>
              <div className='min-w-0'>
                <SheetTitle className='text-lg'>Mock interview</SheetTitle>
                <SheetDescription>{DESCRIPTIONS[phase]}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

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
              />
            )}
            {phase === 'connecting' && (
              <InterviewWaiting
                icon={Mic}
                title={`Connecting you with ${settings.voiceName}`}
                steps={[
                  'Opening your microphone',
                  'Reading your resume and the job',
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
                <>
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
                </>
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
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave the interview?</AlertDialogTitle>
            <AlertDialogDescription>
              {phase === 'evaluating'
                ? "Your feedback is almost ready. If you leave now, you won't see it."
                : "It ends now and won't be scored. To get feedback on your answers so far, use End interview instead."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={leave}
              className={`
                bg-destructive text-white
                hover:bg-destructive/90
              `}
            >
              {phase === 'evaluating' ? 'Leave anyway' : 'Leave interview'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
