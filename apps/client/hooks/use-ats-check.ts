import { useCallback, useRef, useState } from 'react';

import { useService } from '@/hooks/use-http';
import { ResumeService } from '@/services/resume.service';
import { resumeSelector } from '@/stores/features/resume.slice';
import { useAppSelector } from '@/stores/store';
import { type AtsResult } from '@/types/ats.type';
import { toastApiError } from '@/utils/toast-error-message.util';

/**
 * Checks the resume in the editor (unsaved edits included) for ATS
 * readiness. A re-check reports the change in score, so users can see
 * whether their fixes helped.
 */
export function useAtsCheck() {
  const { resume } = useAppSelector(resumeSelector);
  const resumeService = useService(ResumeService);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const lastScore = useRef<number | null>(null);

  const check = useCallback(async () => {
    if (!resume) return;
    setChecking(true);
    try {
      const next = await resumeService.checkAts(resume);
      setPreviousScore(lastScore.current);
      lastScore.current = next.overallScore;
      setResult(next);
    } catch (error) {
      toastApiError(error, "We couldn't check your resume. Please try again.");
    } finally {
      setChecking(false);
    }
  }, [resume, resumeService]);

  return {
    result,
    previousScore,
    checking,
    canCheck: !!resume && !checking,
    check,
  };
}
