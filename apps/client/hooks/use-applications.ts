import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
const STATUSES: ApplicationStatus[] = [
  'SENT',
  'REPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

const statusParam = (value: string | null) =>
  STATUSES.find((status) => status === value);

const pageParam = (value: string | null) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : 1;
};

/**
 * The user's sent applications: one filtered, searched page at a time, with
 * status changes applied optimistically (and rolled back if they fail). The
 * filter, search and page live in the URL (`?status=&q=&page=`), so a reload
 * or a shared link opens the same view.
 */
export function useApplications() {
  const applicationsService = useService(ApplicationsService);
  // Requests sent before Clerk has a session go out without a token
  const { isLoaded } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatusFilter] = useState(() =>
    statusParam(searchParams.get('status')),
  );
  const [search, setSearchInput] = useState(() => searchParams.get('q') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(() =>
    (searchParams.get('q') ?? '').trim(),
  );
  const [page, setPage] = useState(() => pageParam(searchParams.get('page')));
  const [data, setData] = useState<ApplicationsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  // Only the latest request may land, so fast filtering can't show stale rows
  const requestId = useRef(0);

  useEffect(() => {
    const next = search.trim();
    // Only a new search goes back to page 1 (not the one read from the URL)
    if (next === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(next);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [debouncedSearch, search]);

  /** The URL of a page of this view (filter and search kept). */
  const pageHref = useCallback(
    (target: number) => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (target > 1) params.set('page', String(target));
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [debouncedSearch, pathname, status],
  );

  // Replace, not push: Back leaves the page instead of undoing each filter
  useEffect(() => {
    const target = pageHref(page);
    const query = searchParams.toString();
    if (target !== (query ? `${pathname}?${query}` : pathname)) {
      router.replace(target, { scroll: false });
    }
  }, [page, pageHref, pathname, router, searchParams]);

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
      // Past the last page (its last row removed, or an old link): go to
      // the last page there is
      if (!next.items.length && page > 1) {
        setPage(Math.max(1, Math.ceil(next.total / PAGE_SIZE)));
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
    pageHref,
    update,
    remove,
  };
}
