import { useCallback, useRef, useState } from 'react';

import { useService } from '@/hooks/use-http';
import { ResumeService } from '@/services/resume.service';
import { resumeSelector } from '@/stores/features/resume.slice';
import { useAppSelector } from '@/stores/store';
import { type MatchResult } from '@/types/match.type';
import { toastApiError } from '@/utils/toast-error-message.util';

/** The API rejects shorter text as "not a full job description". */
export const JD_MIN_LENGTH = 80;
export const JD_MAX_LENGTH = 20_000;

type Status = 'idle' | 'reading' | 'analyzing';

/**
 * Scores the resume in the editor (unsaved edits included) against a job
 * description. Re-running it for the same JD reports the change in score,
 * so users can see whether their edits helped.
 */
export function useJobMatch() {
  const { resume } = useAppSelector(resumeSelector);
  const resumeService = useService(ResumeService);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  // The last valid score and the JD it was for; kept apart from `result`,
  // which is cleared while the JD is being edited
  const lastScore = useRef<{ jd: string; score: number } | null>(null);

  const analyze = useCallback(async () => {
    const jd = jobDescription.trim();
    if (!resume || jd.length < JD_MIN_LENGTH) return;

    setStatus('analyzing');
    try {
      const next = await resumeService.matchResume(resume, jd);
      setPreviousScore(
        lastScore.current?.jd === jd ? lastScore.current.score : null,
      );
      setResult(next);
      if (next.isValidJobDescription) {
        lastScore.current = { jd, score: next.overallScore };
      }
    } catch (error) {
      toastApiError(error, "We couldn't analyze this match. Please try again.");
    } finally {
      setStatus('idle');
    }
  }, [jobDescription, resume, resumeService]);

  const readPdf = useCallback(
    async (file: File) => {
      setStatus('reading');
      try {
        const text = await resumeService.readJobDescription(file);
        setJobDescription(text.slice(0, JD_MAX_LENGTH));
        // Shown next to the box (a toast would cover the panel's footer)
        setSourceFile(file.name);
      } catch (error) {
        toastApiError(error, "We couldn't read that PDF.");
      } finally {
        setStatus('idle');
      }
    },
    [resumeService],
  );

  /** Back to the job description, keeping it (and the last score). */
  const editJobDescription = useCallback(() => setResult(null), []);

  /** Typed text is the user's own, no longer "from the PDF". */
  const editText = useCallback((text: string) => {
    setJobDescription(text);
    setSourceFile(null);
  }, []);

  return {
    jobDescription,
    setJobDescription: editText,
    sourceFile,
    result,
    previousScore,
    status,
    canAnalyze:
      !!resume &&
      jobDescription.trim().length >= JD_MIN_LENGTH &&
      status === 'idle',
    analyze,
    readPdf,
    editJobDescription,
  };
}
