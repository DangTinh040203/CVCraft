export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

/** A message as any provider takes it; addresses are plain or "Name <a@b>". */
export interface MailMessage {
  from: string;
  to: string[];
  cc?: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: MailAttachment[];
}

/**
 * A mail vendor (Resend today). Implementations translate their own errors
 * into the ones in `mail/domain`, so nothing outside the adapter knows which
 * vendor is in use. Swap vendors by binding another class to
 * MAIL_PROVIDER_TOKEN in MailModule.
 */
export interface MailProvider {
  /** False when credentials are missing; sending then fails fast. */
  isConfigured(): boolean;
  /** Resolves with the vendor's message id. */
  send(message: MailMessage): Promise<{ id: string }>;
}

export const MAIL_PROVIDER_TOKEN = Symbol('MAIL_PROVIDER_TOKEN');
