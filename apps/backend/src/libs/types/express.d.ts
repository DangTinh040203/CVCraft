// Adds Express.Multer.File for uploads. Referenced explicitly: editors that
// open the monorepo root don't always pick up @types/multer on their own
/// <reference types="multer" />

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
