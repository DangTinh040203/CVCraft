import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';

import { type MailProvider } from '@/modules/mail/application/interfaces';
import {
  MailService,
  textToHtml,
} from '@/modules/mail/application/services/mail.service';
import {
  MailNotConfiguredError,
  MailQuotaExceededError,
  MailRejectedError,
} from '@/modules/mail/domain';

function setup(fromAddress: string | null = 'apply@cv-builder.site') {
  const provider: jest.Mocked<MailProvider> = {
    isConfigured: jest.fn().mockReturnValue(true),
    send: jest.fn().mockResolvedValue({ id: 'msg_1' }),
  };
  const config = {
    get: () => fromAddress ?? undefined,
  } as unknown as ConfigService;
  return { provider, service: new MailService(provider, config) };
}

const mail = {
  fromName: 'Jane "JD" Doe <via> CraftCV',
  to: ['hr@acme.com'],
  subject: 'Application',
  text: 'Dear team,\n\nI am <applying>.\nThanks',
};

describe('MailService', () => {
  it('sends from our address under a cleaned-up display name, with HTML', async () => {
    const { provider, service } = setup();

    await expect(service.send(mail)).resolves.toEqual({ id: 'msg_1' });

    const sent = provider.send.mock.calls[0][0];
    expect(sent.from).toBe('"Jane JD Doe via CraftCV" <apply@cv-builder.site>');
    expect(sent.html).toContain('<p style="margin:0 0 14px">Dear team,</p>');
    expect(sent.html).toContain('I am &lt;applying&gt;.<br>Thanks');
  });

  it.each([
    [new MailQuotaExceededError('daily'), ServiceUnavailableException],
    [new MailNotConfiguredError(), ServiceUnavailableException],
    [new MailRejectedError('bad from'), BadRequestException],
  ])('maps %p to an API error', async (error, expected) => {
    const { provider, service } = setup();
    provider.send.mockRejectedValue(error);

    await expect(service.send(mail)).rejects.toBeInstanceOf(expected);
  });

  it('is not configured without a sender address', async () => {
    const { provider, service } = setup(null);

    expect(service.isConfigured()).toBe(false);
    await expect(service.send(mail)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(provider.send).not.toHaveBeenCalled();
  });
});

describe('textToHtml', () => {
  it('escapes markup and keeps paragraphs and line breaks', () => {
    expect(textToHtml('a & b\nc\n\n\nd')).toContain(
      '<p style="margin:0 0 14px">a &amp; b<br>c</p><p style="margin:0 0 14px">d</p>',
    );
  });
});
