import { type ConfigService } from '@nestjs/config';

import {
  MailNotConfiguredError,
  MailQuotaExceededError,
  MailRejectedError,
} from '@/modules/mail/domain';
import { ResendAdapter } from '@/modules/mail/infrastructure/adapters/resend.adapter';

const send = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send } })),
}));

const message = {
  from: 'a@b.com',
  to: ['c@d.com'],
  subject: 's',
  text: 't',
  attachments: [{ filename: 'cv.pdf', content: Buffer.from('pdf') }],
};

const adapter = (apiKey?: string) =>
  new ResendAdapter({ get: () => apiKey } as unknown as ConfigService);

describe('ResendAdapter', () => {
  beforeEach(() => send.mockReset());

  it('returns the message id', async () => {
    send.mockResolvedValue({ data: { id: 're_1' }, error: null });

    await expect(adapter('re_key').send(message)).resolves.toEqual({
      id: 're_1',
    });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['c@d.com'],
        attachments: [
          expect.objectContaining({
            filename: 'cv.pdf',
            content: expect.any(Buffer),
          }),
        ],
      }),
    );
  });

  it.each([
    ['daily_quota_exceeded', MailQuotaExceededError],
    ['rate_limit_exceeded', MailQuotaExceededError],
    ['invalid_from_address', MailRejectedError],
    ['validation_error', MailRejectedError],
  ])('turns Resend %s into a vendor-neutral error', async (name, expected) => {
    send.mockResolvedValue({
      data: null,
      error: { name, message: 'nope', statusCode: 429 },
    });

    await expect(adapter('re_key').send(message)).rejects.toBeInstanceOf(
      expected,
    );
  });

  it('reports itself unconfigured without an API key', async () => {
    const unconfigured = adapter(undefined);

    expect(unconfigured.isConfigured()).toBe(false);
    await expect(unconfigured.send(message)).rejects.toBeInstanceOf(
      MailNotConfiguredError,
    );
  });
});
