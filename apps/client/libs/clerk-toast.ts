import { toast } from '@repo/ui/components/sonner';

interface ClerkError {
  message: string;
  long_message: string;
  code: string;
  meta?: {
    param_name?: string;
  };
}

interface ClerkAPIError {
  errors: ClerkError[];
}

export function isClerkAPIError(error: unknown): error is ClerkAPIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as ClerkAPIError).errors)
  );
}

export function getClerkErrorMessage(error: unknown): string {
  if (isClerkAPIError(error)) {
    const firstError = error.errors[0];
    if (firstError) {
      return firstError.long_message || firstError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong, please try again.';
}

export function getClerkErrorMessages(error: unknown): string[] {
  if (isClerkAPIError(error)) {
    return error.errors.map((err) => err.long_message || err.message);
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return ['Something went wrong, please try again.'];
}

export function showClerkErrors(error: unknown) {
  const messages = getClerkErrorMessages(error);

  messages.forEach((message) => {
    toast.error(message);
  });
}

export function showClerkError(error: unknown) {
  const message = getClerkErrorMessage(error);
  toast.error(message);
}

export function handleClerkError(
  error: unknown,
  options?: {
    showAll?: boolean;
    fallbackMessage?: string;
  },
) {
  const { showAll = false, fallbackMessage } = options || {};

  if (showAll) {
    showClerkErrors(error);
  } else {
    const message = fallbackMessage
      ? isClerkAPIError(error)
        ? getClerkErrorMessage(error)
        : fallbackMessage
      : getClerkErrorMessage(error);
    toast.error(message);
  }
}
