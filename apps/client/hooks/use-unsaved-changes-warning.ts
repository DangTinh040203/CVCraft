import { useEffect } from 'react';

import { resumeSelector } from '@/stores/features/resume.slice';
import { useAppSelector } from '@/stores/store';

/**
 * Asks the browser to confirm a reload, tab close or navigation away while
 * the resume has unsaved changes (an import, edits, Customize). The editor
 * state lives in memory only, so leaving would lose them.
 */
export function useUnsavedChangesWarning() {
  const { isDirty } = useAppSelector(resumeSelector);

  useEffect(() => {
    if (!isDirty) return;

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Older browsers only prompt when returnValue is set
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);
}
