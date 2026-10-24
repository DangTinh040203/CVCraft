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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { Mic } from 'lucide-react';
import { useState } from 'react';

import {
  INTERVIEW_DESCRIPTIONS,
  InterviewPanel,
} from '@/components/interview/interview-panel';
import { useInterview } from '@/hooks/use-interview';

interface InterviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefills the job description (from a job match). */
  jobDescription?: string;
}

/**
 * The builder's mock interview in a side panel, on the resume in the editor
 * and the job. Closing it mid-interview asks first, then abandons it.
 */
export function InterviewSheet({
  open,
  onOpenChange,
  jobDescription,
}: InterviewSheetProps) {
  const interview = useInterview({ withResume: true });
  const [confirmLeave, setConfirmLeave] = useState(false);
  const { phase } = interview;
  const busy =
    phase === 'connecting' || phase === 'live' || phase === 'evaluating';

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
                <SheetDescription>
                  {INTERVIEW_DESCRIPTIONS[phase]}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <InterviewPanel
            interview={interview}
            withResume
            active={open}
            jobDescription={jobDescription}
          />
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
