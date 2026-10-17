import { InternalServerErrorException } from '@nestjs/common';

import { type LlmService } from '@/modules/llm/application/services';
import { ResumeEmailService } from '@/modules/resume/application/services/resume-email.service';

function setup(response: unknown) {
  const llm = {
    sendMessage: jest.fn().mockResolvedValue(JSON.stringify(response)),
  } as unknown as jest.Mocked<LlmService>;
  return { llm, service: new ResumeEmailService(llm) };
}

const input = {
  resume: { title: 'Jane Doe', subTitle: 'Engineer' },
  jobDescription: 'Backend engineer, Go and Postgres',
  tone: 'concise' as const,
};

describe('ResumeEmailService', () => {
  it('tidies the draft and reports placeholders left in it', async () => {
    const { service } = setup({
      subject: '  Application:\n Backend   Engineer ',
      body: 'Dear [Hiring Manager],\r\n\r\n\r\n\r\nI fit [Company Name].\n\nBest,\nJane Doe',
    });

    const email = await service.write(input);

    expect(email.subject).toBe('Application: Backend Engineer');
    expect(email.body).toBe(
      'Dear [Hiring Manager],\n\nI fit [Company Name].\n\nBest,\nJane Doe',
    );
    expect(email.placeholders).toEqual(['[Hiring Manager]', '[Company Name]']);
  });

  it('greets the recipient by name and passes the tone and match', async () => {
    const { llm, service } = setup({ subject: 's', body: 'b' });

    await service.write({
      ...input,
      greeting: 'Kính gửi chị Lan,',
      match: { company: 'Acme', strengths: ['Go at scale'] },
    });

    const prompt = llm.sendMessage.mock.calls[0][0];
    expect(prompt).toContain('"Kính gửi chị Lan,"');
    expect(prompt).toContain('Body of 80-120 words');
    expect(prompt).toContain('Company: Acme');
    expect(prompt).toContain('- Go at scale');
  });

  it('opens with the chosen greeting verbatim, whatever the model wrote', async () => {
    const { service } = setup({
      subject: 'Application',
      body: 'Dear Hiring Manager,\n\nI fit.\n\nBest regards,\nJane Doe',
    });

    const email = await service.write({ ...input, greeting: 'Dear Ms. Lee,' });

    expect(email.body).toBe(
      'Dear Ms. Lee,\n\nI fit.\n\nBest regards,\nJane Doe',
    );
  });

  it('adds the greeting when the draft starts without one', async () => {
    const { service } = setup({
      subject: 'Application',
      body: 'I am applying for the role.\n\nBest regards,\nJane Doe',
    });

    const email = await service.write({ ...input, greeting: 'Dear Ms. Lee,' });

    expect(email.body.startsWith('Dear Ms. Lee,\n\nI am applying')).toBe(true);
  });

  it('signs with the contact details from the CV, under the name', async () => {
    const { service } = setup({
      subject: 'Application',
      body: 'Dear team,\n\nI fit.\n\nBest regards,\nJane Doe',
    });

    const email = await service.write({
      ...input,
      resume: {
        ...input.resume,
        information: [
          { label: 'Email', value: 'jane@doe.com' },
          { label: 'Address', value: 'Hanoi' },
          { label: 'Phone', value: '+84 901 234 567' },
        ],
      },
    });

    expect(email.body).toBe(
      'Dear team,\n\nI fit.\n\nBest regards,\nJane Doe\nPhone: +84 901 234 567\nEmail: jane@doe.com',
    );
  });

  it('fails on an empty draft', async () => {
    const { service } = setup({ subject: '', body: 'x' });

    await expect(service.write(input)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
