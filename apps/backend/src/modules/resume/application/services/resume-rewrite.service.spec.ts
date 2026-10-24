import { BadRequestException } from '@nestjs/common';

import { type LlmService } from '@/modules/llm/application/services';
import { ResumeRewriteService } from '@/modules/resume/application/services/resume-rewrite.service';

function setup(response: unknown) {
  const llm = {
    sendMessage: jest.fn().mockResolvedValue(JSON.stringify(response)),
  } as unknown as jest.Mocked<LlmService>;
  return { llm, service: new ResumeRewriteService(llm) };
}

describe('ResumeRewriteService', () => {
  it('sends the bullets as plain lines and cleans what comes back', async () => {
    const { llm, service } = setup({
      lines: ['- Built the payments API', '  ', 'Cut latency by [X%]'],
    });

    const result = await service.rewrite({
      kind: 'bullets',
      text: '<ol><li data-list="bullet">built payments</li><li data-list="bullet">made it fast</li></ol>',
      role: 'Engineer',
      organization: 'Acme',
      current: true,
    });

    expect(result.lines).toEqual([
      'Built the payments API',
      'Cut latency by [X%]',
    ]);
    const prompt = llm.sendMessage.mock.calls[0][0];
    expect(prompt).toContain('- built payments\n- made it fast');
    expect(prompt).toContain('Current role: yes');
    expect(prompt).not.toContain('<li');
  });

  it('returns a summary as one paragraph', async () => {
    const { service } = setup({ lines: ['Backend engineer.', 'Ships fast.'] });

    await expect(
      service.rewrite({ kind: 'summary', text: '<p>I write code</p>' }),
    ).resolves.toEqual({ lines: ['Backend engineer. Ships fast.'] });
  });

  it('rejects empty text without calling the model', async () => {
    const { llm, service } = setup({ lines: [] });

    await expect(
      service.rewrite({ kind: 'bullets', text: '<p><br></p>' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(llm.sendMessage).not.toHaveBeenCalled();
  });
});
