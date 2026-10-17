/**
 * Vendor-neutral failures a MailProvider reports. (`cause` is declared here:
 * the backend targets ES2021, whose Error type doesn't have it.)
 */
abstract class MailError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** No credentials or sender address configured. */
export class MailNotConfiguredError extends MailError {
  constructor() {
    super('Email sending is not configured');
  }
}

/** The vendor's sending limit (daily, monthly or rate) is used up. */
export class MailQuotaExceededError extends MailError {}

/** The vendor refused this message (bad address, attachment...). */
export class MailRejectedError extends MailError {}
