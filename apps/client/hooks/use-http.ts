'use client';

import { useSession } from '@clerk/nextjs';
import { useMemo } from 'react';

import { HttpService, type HttpServiceOptions } from '@/services/http.service';

type HttpServiceConstructor<T extends HttpService> = new (
  options?: HttpServiceOptions,
) => T;

/* Example usage:
 * Returns an instance of the specified HttpService subclass with authentication token handling.
 * @param ServiceClass - The HttpService subclass to instantiate.
 * @returns An instance of the specified HttpService subclass.
 * @example
 * const resumeService = useService(ResumeService);
 */
export function useService<T extends HttpService>(
  ServiceClass: HttpServiceConstructor<T>,
): T {
  const { session } = useSession();

  const service = useMemo(() => {
    return new ServiceClass({
      getToken: async () => {
        if (!session) {
          return null;
        }

        return await session.getToken();
      },
    });
  }, [ServiceClass, session]);

  return service;
}

export function useHttp() {
  return useService(HttpService);
}
