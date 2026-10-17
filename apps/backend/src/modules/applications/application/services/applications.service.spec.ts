import { HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';

import { type ISentApplicationRepository } from '@/modules/applications/application/interfaces';
import {
  ApplicationsService,
  resumeContactEmail,
} from '@/modules/applications/application/services/applications.service';
import { SentApplication } from '@/modules/applications/domain';
import { type MailService } from '@/modules/mail/application/services';
import { type PdfExportService } from '@/modules/pdf/application/services';
import { User } from '@/modules/user/domain';

// Imported through PdfExportService (rendering is mocked below); Jest can't
// load its ES modules
jest.mock('puppeteer', () => ({}));

const user = new User({
  id: 'u1',
  email: 'tinh@example.com',
  firstName: 'Tinh',
  lastName: 'Cao',
});

const input = {
  to: ' hr@acme.com ',
  subject: ' Application: Engineer ',
  body: ' Dear team, I would like to apply. ',
  jobTitle: 'Engineer',
  cv: {
    templateKey: 'template-04',
    resume: { title: 'Cao Đặng Tịnh' } as Record<string, unknown>,
  },
};

function setup({ used = 0, configured = true } = {}) {
  const repository: jest.Mocked<ISentApplicationRepository> = {
    countSince: jest.fn().mockResolvedValue(used),
    create: jest
      .fn()
      .mockImplementation((data) =>
        Promise.resolve(new SentApplication({ ...data, id: 'a1' })),
      ),
    findRecent: jest.fn(),
  };
  const mail = {
    isConfigured: jest.fn().mockReturnValue(configured),
    send: jest.fn().mockResolvedValue({ id: 'msg_1' }),
  } as unknown as jest.Mocked<MailService>;
  const pdf = {
    render: jest.fn().mockResolvedValue(new Uint8Array([37, 80, 68, 70])),
  } as unknown as jest.Mocked<PdfExportService>;
  const config = { getOrThrow: () => 5 } as unknown as ConfigService;
  return {
    repository,
    mail,
    pdf,
    service: new ApplicationsService(repository, mail, pdf, config),
  };
}

describe('ApplicationsService', () => {
  it('sends under the candidate name, replies and a copy to them, CV attached', async () => {
    const { mail, pdf, repository, service } = setup({ used: 2 });

    const { quota } = await service.send(user, input);

    expect(pdf.render).toHaveBeenCalledWith(input.cv);
    expect(mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        fromName: 'Cao Đặng Tịnh',
        to: ['hr@acme.com'],
        cc: ['tinh@example.com'],
        replyTo: 'tinh@example.com',
        subject: 'Application: Engineer',
        text: 'Dear team, I would like to apply.',
        attachments: [
          expect.objectContaining({
            filename: 'Cao-Dang-Tinh-Resume.pdf',
            contentType: 'application/pdf',
          }),
        ],
      }),
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        toEmail: 'hr@acme.com',
        providerMessageId: 'msg_1',
      }),
    );
    expect(quota).toMatchObject({ used: 3, remaining: 2 });
  });

  it('sends replies and the copy to the email on the resume', async () => {
    const { mail, service } = setup();

    await service.send(user, {
      ...input,
      cv: {
        ...input.cv,
        resume: {
          title: 'Cao Đặng Tịnh',
          information: [
            { label: 'Phone', value: '+84 862040542' },
            { label: 'Email', value: ' tinhcaodang.work@gmail.com ' },
          ],
        },
      },
    });

    expect(mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'tinhcaodang.work@gmail.com',
        cc: ['tinhcaodang.work@gmail.com'],
      }),
    );
  });

  it('skips the copy when sending to yourself', async () => {
    const { mail, service } = setup();

    await service.send(user, { ...input, to: 'TINH@example.com' });

    expect(mail.send.mock.calls[0][0].cc).toBeUndefined();
  });

  it('refuses past the daily limit, before rendering anything', async () => {
    const { mail, pdf, service } = setup({ used: 5 });

    await expect(service.send(user, input)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
    expect(pdf.render).not.toHaveBeenCalled();
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('refuses when sending is not configured', async () => {
    const { pdf, service } = setup({ configured: false });

    await expect(service.send(user, input)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(pdf.render).not.toHaveBeenCalled();
  });

  it('records nothing when the send fails', async () => {
    const { mail, repository, service } = setup();
    mail.send.mockRejectedValue(new ServiceUnavailableException('quota'));

    await expect(service.send(user, input)).rejects.toThrow('quota');
    expect(repository.create).not.toHaveBeenCalled();
  });
});

describe('resumeContactEmail', () => {
  const resume = (information: Array<{ label: string; value: string }>) => ({
    information,
  });

  it('prefers the contact labelled as email', () => {
    expect(
      resumeContactEmail(
        resume([
          { label: 'Website', value: 'old@mail.com' },
          { label: 'E-mail', value: 'jane@doe.com' },
        ]),
      ),
    ).toBe('jane@doe.com');
  });

  it('falls back to any value that is an email address', () => {
    expect(
      resumeContactEmail(resume([{ label: '', value: 'jane@doe.com' }])),
    ).toBe('jane@doe.com');
  });

  it('is undefined when the resume has no usable email', () => {
    expect(
      resumeContactEmail(resume([{ label: 'Email', value: 'not an email' }])),
    ).toBeUndefined();
    expect(resumeContactEmail({})).toBeUndefined();
  });
});
