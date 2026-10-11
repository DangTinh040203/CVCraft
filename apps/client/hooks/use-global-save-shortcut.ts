import { useEffect, useRef } from 'react';

import { useSyncResume } from '@/hooks/use-sync-resume';

export function useGlobalSaveShortcut() {
  const { sync } = useSyncResume();
  const syncRef = useRef(sync);

  // Always keep the ref up-to-date
  useEffect(() => {
    syncRef.current = sync;
  }, [sync]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        syncRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Register once, never re-attach
}
