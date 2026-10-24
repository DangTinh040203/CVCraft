'use client';
import { Button } from '@repo/ui/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui/components/tooltip';
import { cn } from '@repo/ui/lib/utils';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Mic,
  Save,
  Target,
  Upload,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import DownloadPdf from '@/components/builder-screens/download-pdf';
import { InterviewSheet } from '@/components/builder-screens/interview/interview-sheet';
import { JobMatchSheet } from '@/components/builder-screens/job-match/job-match-sheet';
import { useImportResume } from '@/hooks/use-import-resume';
import { useSyncResume } from '@/hooks/use-sync-resume';
import {
  templateConfigSelector,
  updatePreviewMode,
} from '@/stores/features/template.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';

const ResumeControl = () => {
  const { resume, sync, isSyncing } = useSyncResume();
  const { previewMode } = useAppSelector(templateConfigSelector);
  const dispatch = useAppDispatch();
  const { importResume, isImporting } = useImportResume();
  const importInputRef = React.useRef<HTMLInputElement>(null);
  // The panel stays mounted, so its job description and last score survive
  // closing it to edit the resume
  // `?match=1` (from My applications' "Apply for a job") opens it right away.
  // The flag stays until the panel is closed: this component can remount
  // while the builder loads, and would otherwise come back with it closed.
  const searchParams = useSearchParams();
  const router = useRouter();
  const [matchOpen, setMatchOpenState] = React.useState(
    () => searchParams.get('match') === '1',
  );

  const setMatchOpen = (open: boolean) => {
    setMatchOpenState(open);
    if (open || searchParams.get('match') !== '1') return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('match');
    const query = params.toString();
    router.replace(`/builder${query ? `?${query}` : ''}`, { scroll: false });
  };

  const [interviewOpen, setInterviewOpen] = React.useState(false);
  // Set when the interview is opened from a job match, for that job
  const [interviewJd, setInterviewJd] = React.useState<string>();

  const openInterview = (jobDescription?: string) => {
    setInterviewJd(jobDescription);
    setInterviewOpen(true);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so the same file can be picked again
    e.target.value = '';
    if (file) void importResume(file);
  };

  const handleTogglePreviewMode = () => {
    dispatch(updatePreviewMode(!previewMode));
  };

  return (
    <div className='mb-4'>
      <input
        ref={importInputRef}
        type='file'
        accept='.pdf,application/pdf'
        className='hidden'
        onChange={handleImport}
      />

      <div className='my-4 flex items-center gap-4'>
        <div
          className={`
            from-primary to-primary/70 flex h-10 w-10 shrink-0 items-center
            justify-center rounded-xl bg-linear-to-br
            md:h-12 md:w-12
          `}
        >
          <FileText
            className={`
              text-primary-foreground h-5 w-5
              md:h-6 md:w-6
            `}
          />
        </div>
        <div>
          <h1
            className={`
              font-display from-foreground to-foreground/70 bg-linear-to-br
              bg-clip-text text-xl font-bold text-transparent
              md:text-2xl
              lg:text-3xl
            `}
          >
            Resume Builder
          </h1>
          <p
            className={`
              text-muted-foreground text-xs
              md:text-sm
            `}
          >
            Build a standout resume in minutes.
          </p>
        </div>
      </div>

      <div
        className={`
          grid grid-cols-2 gap-2
          sm:grid-cols-3 sm:gap-3
          lg:flex lg:flex-wrap lg:gap-4
        `}
      >
        <motion.div
          className={`
            w-full
            lg:w-auto
          `}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='gradient'
                className={cn(
                  `
                    w-full shrink-0 gap-2 transition-all duration-200
                    lg:w-auto
                  `,
                )}
                onClick={sync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Save className='h-4 w-4' />
                )}
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save your changes (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>

        <motion.div
          className={`
            w-full
            lg:w-auto
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant='secondary'
            className={cn(
              `
                w-full shrink-0 gap-2 transition-colors duration-200
                lg:w-auto
              `,
            )}
            onClick={handleTogglePreviewMode}
          >
            <motion.div
              initial={false}
              animate={{ rotate: previewMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {previewMode ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </motion.div>
            {previewMode ? 'Edit' : 'Customize'}
          </Button>
        </motion.div>

        {resume && (
          <div
            className={`
              w-full
              lg:w-auto
            `}
          >
            <DownloadPdf />
          </div>
        )}

        <div
          className={`
            w-full
            lg:w-auto
          `}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='secondary'
                className={`
                  border-primary w-full gap-2 border shadow-xl
                  lg:w-auto
                `}
                onClick={() => importInputRef.current?.click()}
                disabled={isImporting || !resume}
              >
                {isImporting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Upload className='h-4 w-4' />
                )}
                {isImporting ? 'Importing...' : 'Import Resume'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Upload a PDF resume and let AI fill in your details
                automatically.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div
          className={`
            w-full
            lg:w-auto
          `}
        >
          <Button
            variant='secondary'
            className={`
              border-primary w-full gap-2 border shadow-xl
              lg:w-auto
            `}
            onClick={() => setMatchOpen(true)}
            disabled={!resume}
          >
            <Target className='h-4 w-4' />
            Match to Job
          </Button>
        </div>

        <div
          className={`
            w-full
            lg:w-auto
          `}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='secondary'
                className={`
                  border-primary w-full gap-2 border shadow-xl
                  lg:w-auto
                `}
                onClick={() => openInterview()}
                disabled={!resume}
              >
                <Mic className='h-4 w-4' />
                Mock Interview
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Practice out loud with an AI interviewer, then get feedback.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <JobMatchSheet
        open={matchOpen}
        onOpenChange={setMatchOpen}
        onPracticeInterview={(jobDescription) => {
          setMatchOpen(false);
          openInterview(jobDescription);
        }}
      />
      {/* Mounted while closed too, like the match panel, so its settings
          are kept between interviews */}
      <InterviewSheet
        open={interviewOpen}
        onOpenChange={setInterviewOpen}
        jobDescription={interviewJd}
      />
    </div>
  );
};

export default ResumeControl;
