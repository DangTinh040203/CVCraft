import { toast } from '@repo/ui/components/sonner';
import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';

import { useService } from '@/hooks/use-http';
import { ResumeService } from '@/services/resume.service';
import { resumeSelector, setResume } from '@/stores/features/resume.slice';
import {
  normalizeFormat,
  updateTemplateConfigFormat,
} from '@/stores/features/template.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { type ErrorResponse } from '@/types/error.response';
import { applyParsedResume } from '@/utils/resume.utils';
import { toastErrorMessage } from '@/utils/toast-error-message.util';

/**
 * Reads a PDF resume with AI and fills the editor's resume with it. Nothing
 * is saved: the user reviews the result in the builder and saves from there.
 */
export function useImportResume() {
  const dispatch = useAppDispatch();
  const { resume } = useAppSelector(resumeSelector);
  const resumeService = useService(ResumeService);
  const [isImporting, setIsImporting] = useState(false);

  const importResume = useCallback(
    async (file: File) => {
      setIsImporting(true);
      try {
        // Outside the builder the resume may not be loaded yet; it's fetched
        // alongside, so the parsed one keeps its id and saved format
        const [parsed, base] = await Promise.all([
          resumeService.parseResume(file),
          resume ?? resumeService.getResume(),
        ]);
        if (!resume && base.format) {
          dispatch(updateTemplateConfigFormat(normalizeFormat(base.format)));
        }
        dispatch(setResume(applyParsedResume(base, parsed)));
        toast.success('Resume imported. Review it, then save.');
        return true;
      } catch (e) {
        const error =
          e instanceof AxiosError
            ? (e.response?.data as ErrorResponse | undefined)
            : undefined;
        if (error?.message) {
          toastErrorMessage(error.message);
        } else {
          toast.error(
            "We couldn't read your resume. Please try a different file.",
          );
        }
        return false;
      } finally {
        setIsImporting(false);
      }
    },
    [dispatch, resume, resumeService],
  );

  return { importResume, isImporting };
}
