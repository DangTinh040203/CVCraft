import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useService } from '@/hooks/use-http';
import { ApplicationsService } from '@/services/applications.service';
import {
  type ApplicationsPage,
  type ApplicationStatus,
  type SentApplication,
  type UpdateApplicationPayload,
} from '@/types/application.type';
import { toastApiError } from '@/utils/toast-error-message.util';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * The user's sent applications: one filtered, searched page at a time, with
 * status changes applied optimistically (and rolled back if they fail).
 */
export function useApplications() {
  const applicationsService = useService(ApplicationsService);
  // Requests sent before Clerk has a session go out without a token
  const { isLoaded } = useAuth();

  const [status, setStatusFilter] = useState<ApplicationStatus | undefined>();
  const [search, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ApplicationsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  // Only the latest request may land, so fast filtering can't show stale rows
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const next = await applicationsService.getApplications({
        status,
        search: debouncedSearch || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      if (id !== requestId.current) return;
      // Removing the last row of a page leaves it empty: step back one
      if (!next.items.length && page > 1) {
        setPage(page - 1);
        return;
      }
      setData(next);
      setFailed(false);
    } catch (error) {
      if (id !== requestId.current) return;
      setFailed(true);
      toastApiError(error, 'Could not load your applications.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [applicationsService, debouncedSearch, page, status]);

  useEffect(() => {
    if (isLoaded) void load();
  }, [isLoaded, load]);

  const setStatus = useCallback((next: ApplicationStatus | undefined) => {
    setStatusFilter(next);
    setPage(1);
  }, []);

  /** Saves a change; returns the saved application, or null on failure. */
  const update = useCallback(
    async (application: SentApplication, payload: UpdateApplicationPayload) => {
      const previous = data;
      const moved = payload.status && payload.status !== application.status;
      // Optimistic: the row and the per-status counts change right away
      setData(
        (current) =>
          current && {
            ...current,
            items: current.items.map((item) =>
              item.id === application.id ? { ...item, ...payload } : item,
            ),
            counts: moved
              ? {
                  ...current.counts,
                  [application.status]: current.counts[application.status] - 1,
                  [payload.status!]: current.counts[payload.status!] + 1,
                }
              : current.counts,
          },
      );
      try {
        const saved = await applicationsService.updateApplication(
          application.id,
          payload,
        );
        setData(
          (current) =>
            current && {
              ...current,
              items: current.items.map((item) =>
                item.id === saved.id ? saved : item,
              ),
            },
        );
        // A row that no longer fits the status filter leaves the list
        if (moved && status) void load();
        return saved;
      } catch (error) {
        setData(previous);
        toastApiError(error, 'Could not save the change.');
        return null;
      }
    },
    [applicationsService, data, load, status],
  );

  const remove = useCallback(
    async (application: SentApplication) => {
      try {
        await applicationsService.deleteApplication(application.id);
        await load();
        return true;
      } catch (error) {
        toastApiError(error, 'Could not remove the application.');
        return false;
      }
    },
    [applicationsService, load],
  );

  const total = data?.total ?? 0;
  const counts = data?.counts;
  return {
    data,
    items: data?.items ?? [],
    total,
    /** All listed applications, whatever the filter. */
    allCount: counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0,
    counts,
    quota: data?.quota ?? null,
    loading,
    failed,
    reload: load,
    status,
    setStatus,
    search,
    setSearch: setSearchInput,
    /** Whether a filter or search is narrowing the list. */
    filtered: !!status || !!debouncedSearch,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
    setPage,
    update,
    remove,
  };
}
