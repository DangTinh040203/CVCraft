import { type JwtPayload } from '@clerk/types';

import { type ClerkWebhook } from '@/modules/user/domain/clerk-webhook.domain';

declare global {
  namespace Express {
    interface Request {
      auth: JwtPayload;
      clerkEvent: ClerkWebhook | null;
      requestId: string;
    }
  }
}
