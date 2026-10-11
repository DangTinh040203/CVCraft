import { toast } from '@repo/ui/components/sonner';
import { AxiosError } from 'axios';
import { useCallback, useRef, useState } from 'react';

import { useService } from '@/hooks/use-http';
import { ResumeService } from '@/services/resume.service';
import { resumeSelector, setResume } from '@/stores/features/resume.slice';
import {
  templateFormatSelector,
  templateSelectedSelector,
} from '@/stores/features/template.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { type ErrorResponse } from '@/types/error.response';
import { resumeToUpdateDto } from '@/utils/resume.utils';
import { toastErrorMessage } from '@/utils/toast-error-message.util';

/**
 * Custom hook to sync Redux resume state to backend.
 * Use this in forms - dispatch changes to store, call sync() on submit/next.
 *
 * NOTE: Ctrl+S shortcut is handled globally by useGlobalSaveShortcut().
 * Do NOT register keyboard listeners here to avoid duplicate requests.
 */
export function useSyncResume() {
  const dispatch = useAppDispatch();
  const { resume } = useAppSelector(resumeSelector);
  const templateKey = useAppSelector(templateSelectedSelector);
  const format = useAppSelector(templateFormatSelector);
  const resumeService = useService(ResumeService);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  const sync = useCallback(async () => {
    if (!resume) {
      toast.error('No resume to save yet.');
      return false;
    }

    // Prevent concurrent sync requests
    if (isSyncingRef.current) {
      return false;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const updatedResume = await resumeService.updateResume(
        resume.id,
        resumeToUpdateDto(resume, { templateKey, format }),
      );
      dispatch(setResume(updatedResume));
      return true;
    } catch (e) {
      if (e instanceof AxiosError) {
        const error = e.response?.data as ErrorResponse;
        toastErrorMessage(error.message);
      } else {
        toast.error('Could not save your resume. Please try again.');
      }

      return false;
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [dispatch, format, resume, resumeService, templateKey]);

  return { sync, isSyncing, resume };
}
