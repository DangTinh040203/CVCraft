import { BadRequestException } from '@nestjs/common';

import { type LlmService } from '@/modules/llm/application/services';
import { ResumeTailorService } from '@/modules/resume/application/services/resume-tailor.service';

const JD = 'Senior Frontend Engineer. React, TypeScript, REST APIs, Tailwind.';

const resume = {
  overview: '<p>Engineer who builds web apps.</p>',
  skills: [{ label: 'Languages', value: 'TypeScript' }],
  workExperiences: [
    {
      id: 'work-a',
      position: 'Engineer',
      company: 'Acme',
      endDate: null,
      description:
        '<ol><li data-list="bullet">built web services</li><li data-list="bullet">wrote React screens</li></ol>',
    },
    { id: 'work-empty', position: 'Intern', company: 'Beta', description: '' },
  ],
  projects: [
    {
      id: 'proj-a',
      title: 'Shop',
      position: 'Lead',
      responsibilities: '<p>made the checkout</p>',
    },
  ],
};

function setup(response: unknown) {
  const llm = {
    sendMessage: jest.fn().mockResolvedValue(JSON.stringify(response)),
  } as unknown as jest.Mocked<LlmService>;
  return { llm, service: new ResumeTailorService(llm) };
}

describe('ResumeTailorService', () => {
  it('sends short refs and plain lines, and maps changes back to entries', async () => {
    const { llm, service } = setup({
      changes: [
        {
          ref: 'exp-1',
          lines: ['- Built REST APIs', 'Built React and TypeScript screens'],
          reason: 'Uses the JD wording',
          keywords: ['REST APIs', 'TypeScript', 'Kubernetes'],
        },
        {
          ref: 'summary',
          lines: ['Frontend engineer', 'building React apps.'],
          reason: 'Leads with the role',
          keywords: [],
        },
      ],
    });

    const { changes } = await service.tailor(resume, JD, ['REST APIs']);

    const prompt = llm.sendMessage.mock.calls[0][0];
    expect(prompt).toContain(
      '[exp-1] bullets — Work experience: Engineer at Acme (current role)',
    );
    expect(prompt).toContain('- built web services\n- wrote React screens');
    expect(prompt).toContain('[proj-1] bullets');
    // The empty experience isn't offered, and no ids or HTML reach the model
    expect(prompt).not.toContain('Intern at Beta (current role)\n-');
    expect(prompt).not.toContain('work-a');
    expect(prompt).not.toContain('<li');

    // Resume order (summary first), each mapped to its entry
    expect(changes.map((c) => [c.ref, c.section, c.itemId])).toEqual([
      ['summary', 'summary', null],
      ['exp-1', 'experience', 'work-a'],
    ]);
    expect(changes[0].lines).toEqual([
      'Frontend engineer building React apps.',
    ]);
    expect(changes[1]).toMatchObject({
      kind: 'bullets',
      title: 'Engineer · Acme',
      original: ['built web services', 'wrote React screens'],
      lines: ['Built REST APIs', 'Built React and TypeScript screens'],
    });
    // Terms the field didn't have: backed by the resume (Skills), or not
    // anywhere in it; ones the text doesn't contain are dropped
    expect(changes[1].keywords).toEqual(['TypeScript']);
    expect(changes[1].unverified).toEqual(['REST APIs']);
  });

  it('drops unknown refs, duplicates and rewrites identical to the original', async () => {
    const { service } = setup({
      changes: [
        { ref: 'exp-9', lines: ['Made up'], reason: '', keywords: [] },
        {
          ref: 'proj-1',
          lines: ['Made the checkout'],
          reason: '',
          keywords: [],
        },
        { ref: 'summary', lines: ['First'], reason: '', keywords: [] },
        { ref: 'summary', lines: ['Second'], reason: '', keywords: [] },
      ],
    });

    const { changes } = await service.tailor(resume, JD);

    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ ref: 'summary', lines: ['First'] });
  });

  it('rejects a resume with nothing to tailor without calling the model', async () => {
    const { llm, service } = setup({ changes: [] });

    await expect(
      service.tailor({ overview: '<p><br></p>', workExperiences: [] }, JD),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(llm.sendMessage).not.toHaveBeenCalled();
  });
});
