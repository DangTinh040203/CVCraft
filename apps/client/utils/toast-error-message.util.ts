import { toast } from '@repo/ui/components/sonner';
import { AxiosError } from 'axios';

import { type ErrorResponse } from '@/types/error.response';

export const toastErrorMessage = (msg: string | Array<string>) => {
  if (Array.isArray(msg)) {
    toast.error(msg.join(', '));
  } else {
    toast.error(msg);
  }
};

/**
 * Toasts what the API said went wrong (its `message`), or `fallback` when
 * the error didn't come from the API (network down, a bug).
 */
export const toastApiError = (error: unknown, fallback: string) => {
  const body =
    error instanceof AxiosError
      ? (error.response?.data as ErrorResponse | undefined)
      : undefined;
  toastErrorMessage(body?.message ?? fallback);
};
