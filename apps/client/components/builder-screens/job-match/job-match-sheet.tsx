'use client';

import { Button } from '@repo/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import {
  ArrowRight,
  FileWarning,
  Loader2,
  PenLine,
  RotateCw,
  Send,
  Target,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { ApplicationEmailPanel } from '@/components/builder-screens/job-match/application-email-panel';
import { JobDescriptionStep } from '@/components/builder-screens/job-match/job-description-step';
import { MatchAnalyzing } from '@/components/builder-screens/job-match/match-analyzing';
import { MatchResultView } from '@/components/builder-screens/job-match/match-result';
import { useApplicationEmail } from '@/hooks/use-application-email';
import { useJobMatch } from '@/hooks/use-job-match';
import { resumeSelector, updateResume } from '@/stores/features/resume.slice';
import { updatePreviewMode } from '@/stores/features/template.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { type MatchSuggestion } from '@/types/match.type';

/** Where keywords added from a match go, so they're easy to review. */
const ADDED_SKILLS_LABEL = 'Additional Skills';

interface JobMatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Scores the resume against a job description in a side panel, so the
 * resume stays in view: paste or upload the JD, read the score, jump to the
 * section a suggestion is about, then re-analyze to see the score move.
 */
export function JobMatchSheet({ open, onOpenChange }: JobMatchSheetProps) {
  const match = useJobMatch();
  const { resume } = useAppSelector(resumeSelector);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());
  // The email for the matched job: its own screen in this panel, kept while
  // the user goes back to the results
  const email = useApplicationEmail(match.jobDescription, match.result);
  const [panel, setPanel] = useState<'match' | 'email'>('match');

  const analyzing = match.status === 'analyzing';
  const view = analyzing
    ? 'analyzing'
    : !match.result
      ? 'input'
      : match.result.isValidJobDescription
        ? panel === 'email'
          ? 'email'
          : 'result'
        : 'invalid';

  const addKeyword = (keyword: string) => {
    if (!resume) return;
    const skills = resume.skills;
    const group = skills.find(
      (skill) =>
        skill.label.trim().toLowerCase() === ADDED_SKILLS_LABEL.toLowerCase(),
    );
    dispatch(
      updateResume({
        skills: group
          ? skills.map((skill) =>
              skill === group
                ? {
                    ...skill,
                    value: [skill.value, keyword].filter(Boolean).join(', '),
                  }
                : skill,
            )
          : [
              ...skills,
              {
                id: crypto.randomUUID(),
                label: ADDED_SKILLS_LABEL,
                value: keyword,
                resumeId: resume.id,
              },
            ],
      }),
    );
    // The chip turns green; the result view reminds to save (a toast
    // would cover the panel's footer)
    setAddedKeywords((current) => new Set(current).add(keyword));
  };

  const goToSection = (section: MatchSuggestion['section']) => {
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
              <Target className='text-primary-foreground size-5' />
            </div>
            <div className='min-w-0'>
              <SheetTitle className='text-lg'>
                {view === 'email' ? 'Apply for this job' : 'Match to a job'}
              </SheetTitle>
              <SheetDescription>
                {view === 'email'
                  ? 'Write the email, then send it with your resume.'
                  : 'See how well your resume fits a role, and what to change.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {view === 'email' && match.result ? (
          <ApplicationEmailPanel
            email={email}
            company={match.result.company}
            contactName={match.result.contactName}
            onBack={() => setPanel('match')}
          />
        ) : (
          <>
            <div className='flex-1 overflow-y-auto px-6 py-6'>
              {view === 'input' && (
                <JobDescriptionStep
                  value={match.jobDescription}
                  onChange={match.setJobDescription}
                  onPdf={(file) => void match.readPdf(file)}
                  reading={match.status === 'reading'}
                  sourceFile={match.sourceFile}
                />
              )}
              {view === 'analyzing' && <MatchAnalyzing />}
              {view === 'invalid' && match.result && (
                <div className='flex flex-col items-center py-10 text-center'>
                  <div
                    className={`
                      mb-4 flex size-14 items-center justify-center rounded-2xl
                      bg-amber-50 text-amber-600
                      dark:bg-amber-500/15 dark:text-amber-300
                    `}
                  >
                    <FileWarning className='size-7' />
                  </div>
                  <h3 className='font-semibold'>
                    That doesn&apos;t look like a job description
                  </h3>
                  <p
                    className={`
                      text-muted-foreground mt-2 max-w-sm text-sm
                      leading-relaxed
                    `}
                  >
                    {match.result.summary}
                  </p>
                </div>
              )}
              {view === 'result' && match.result && (
                <MatchResultView
                  result={match.result}
                  previousScore={match.previousScore}
                  addedKeywords={addedKeywords}
                  onAddKeyword={addKeyword}
                  onGoToSection={goToSection}
                />
              )}
            </div>

            <div className='bg-background space-y-2 border-t px-6 py-4'>
              {view === 'input' || view === 'analyzing' ? (
                <Button
                  variant='gradient'
                  className='h-11 w-full gap-2'
                  disabled={!match.canAnalyze}
                  onClick={() => void match.analyze()}
                >
                  {analyzing ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    <Target className='size-4' />
                  )}
                  {analyzing ? 'Analyzing…' : 'Analyze match'}
                </Button>
              ) : view === 'result' ? (
                <>
                  {/* Applying is the next step after a match, so it leads;
                      editing and re-running are secondary */}
                  <Button
                    variant='gradient'
                    className='group h-12 w-full gap-2 text-base'
                    onClick={() => setPanel('email')}
                  >
                    <Send className='size-4' />
                    Apply for this job
                    <ArrowRight
                      className={`
                        size-4 transition-transform
                        group-hover:translate-x-0.5
                      `}
                    />
                  </Button>
                  <div className='grid grid-cols-2 gap-2'>
                    <Button
                      variant='outline'
                      className='h-9 gap-1.5 text-sm'
                      onClick={match.editJobDescription}
                    >
                      <PenLine className='size-3.5' />
                      Edit job description
                    </Button>
                    <Button
                      variant='outline'
                      className='h-9 gap-1.5 text-sm'
                      disabled={!match.canAnalyze}
                      onClick={() => void match.analyze()}
                    >
                      <RotateCw className='size-3.5' />
                      Re-analyze
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  variant='outline'
                  className='h-11 w-full gap-2'
                  onClick={match.editJobDescription}
                >
                  <PenLine className='size-4' />
                  Edit job description
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
