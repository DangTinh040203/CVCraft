'use client';

import { Button } from '@repo/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { Loader2, RotateCw, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AtsResultView } from '@/components/builder-screens/ats-check/ats-result';
import { MatchAnalyzing } from '@/components/builder-screens/job-match/match-analyzing';
import { useAddSkillKeyword } from '@/hooks/use-add-skill-keyword';
import { useAtsCheck } from '@/hooks/use-ats-check';
import { updatePreviewMode } from '@/stores/features/template.slice';
import { useAppDispatch } from '@/stores/store';
import { type AtsIssue } from '@/types/ats.type';

const CHECKING_STEPS = [
  'Checking your contact details',
  'Reading every bullet',
  'Finding your target role',
  'Comparing role keywords',
];

const CHECKS = [
  {
    title: 'Contact details',
    text: 'Name, email, phone and a profile link an ATS can read.',
  },
  {
    title: 'Sections',
    text: 'Summary, experience, education and skills, with valid dates.',
  },
  { title: 'Length', text: 'Enough to show your work, short enough to skim.' },
  {
    title: 'Impact & numbers',
    text: 'Bullets that lead with a verb and show results in numbers.',
  },
  {
    title: 'Keywords',
    text: 'What recruiters search for in the role your resume targets.',
  },
];

interface AtsCheckSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Scores the resume for ATS readiness without a job description, in a side
 * panel: what to fix (each linked to its section) and the keywords the
 * target role usually needs. Re-checking shows whether the fixes helped.
 */
export function AtsCheckSheet({ open, onOpenChange }: AtsCheckSheetProps) {
  const ats = useAtsCheck();
  const { addedKeywords, addKeyword } = useAddSkillKeyword();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToSection = (section: AtsIssue['section']) => {
    onOpenChange(false);
    dispatch(updatePreviewMode(false));
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', section);
    router.push(`/builder?${params.toString()}`, { scroll: false });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
              <ShieldCheck className='text-primary-foreground size-5' />
            </div>
            <div className='min-w-0'>
              <SheetTitle className='text-lg'>ATS check</SheetTitle>
              <SheetDescription>
                How applicant tracking systems and recruiters will read your
                resume, no job description needed.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto px-6 py-6'>
          {ats.checking ? (
            <MatchAnalyzing steps={CHECKING_STEPS} />
          ) : ats.result ? (
            <AtsResultView
              result={ats.result}
              previousScore={ats.previousScore}
              addedKeywords={addedKeywords}
              onAddKeyword={addKeyword}
              onGoToSection={goToSection}
            />
          ) : (
            <div className='space-y-5'>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                We check your resume as it is in the editor, unsaved changes
                included:
              </p>
              <ol className='space-y-3'>
                {CHECKS.map((item, index) => (
                  <li key={item.title} className='flex gap-3'>
                    <span
                      className={`
                        bg-primary/10 text-primary flex size-6 shrink-0
                        items-center justify-center rounded-full text-xs
                        font-semibold
                      `}
                    >
                      {index + 1}
                    </span>
                    <div className='text-sm leading-relaxed'>
                      <p className='font-medium'>{item.title}</p>
                      <p className='text-muted-foreground'>{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className='bg-background border-t px-6 py-4'>
          <Button
            variant={ats.result ? 'outline' : 'gradient'}
            className='h-11 w-full gap-2'
            disabled={!ats.canCheck}
            onClick={() => void ats.check()}
          >
            {ats.checking ? (
              <Loader2 className='size-4 animate-spin' />
            ) : ats.result ? (
              <RotateCw className='size-4' />
            ) : (
              <ShieldCheck className='size-4' />
            )}
            {ats.checking
              ? 'Checking…'
              : ats.result
                ? 'Check again'
                : 'Run ATS check'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
