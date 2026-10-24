import { type LlmService } from '@/modules/llm/application/services';
import {
  checkContact,
  checkImpact,
  checkLength,
  checkSections,
  ResumeAtsService,
} from '@/modules/resume/application/services/resume-ats.service';

const bullets = (...items: string[]) =>
  `<ol>${items.map((i) => `<li data-list="bullet">${i}</li>`).join('')}</ol>`;

const resume = {
  title: 'Jane Doe',
  subTitle: 'Backend Engineer',
  overview: '<p>Backend engineer building payment APIs in Go.</p>',
  information: [
    { label: 'Email', value: 'jane@example.com' },
    { label: 'Phone', value: '+84 912 345 678' },
    { label: 'LinkedIn', value: 'linkedin.com/in/jane' },
  ],
  skills: [{ label: 'Languages', value: 'Go, TypeScript' }],
  workExperiences: [
    {
      company: 'Acme',
      position: 'Engineer',
      description: bullets(
        'Cut checkout latency by 40% by caching rates',
        'Responsible for the payments API',
      ),
      startDate: '2021-03-01T00:00:00.000Z',
      endDate: null as string | null,
    },
  ],
  projects: [],
  educations: [{ school: 'HCMUT', degree: 'BSc', major: 'CS' }],
};

function setup(response: unknown) {
  const llm = {
    sendMessage:
      response instanceof Error
        ? jest.fn().mockRejectedValue(response)
        : jest.fn().mockResolvedValue(JSON.stringify(response)),
  } as unknown as jest.Mocked<LlmService>;
  return { llm, service: new ResumeAtsService(llm) };
}

describe('ATS checks', () => {
  it('finds name, email, phone and link', () => {
    expect(checkContact(resume).score).toBe(100);
    const { score, issues } = checkContact({ ...resume, information: [] });
    expect(score).toBe(20);
    expect(issues.map((i) => i.severity)).toEqual([
      'critical',
      'warning',
      'tip',
    ]);
  });

  it('does not take text with digits for a phone number', () => {
    const { score } = checkContact({
      ...resume,
      information: [{ label: 'Address', value: '12345678 Le Loi, Hanoi' }],
    });
    expect(score).toBe(20);
  });

  it('flags missing sections and backwards dates', () => {
    const { score, issues } = checkSections({
      ...resume,
      overview: '<p><br></p>',
      workExperiences: [
        {
          ...resume.workExperiences[0],
          startDate: '2022-01-01',
          endDate: '2021-01-01',
        },
      ],
    });
    expect(score).toBe(80);
    expect(issues.map((i) => i.section)).toEqual(['summary', 'experience']);
  });

  it('scores numbers and weak openers in bullets', () => {
    const impact = checkImpact(resume);
    expect(impact.bullets).toBe(2);
    expect(impact.withNumbers).toBe(1);
    // half the bullets have a number (full marks there), half open weakly
    expect(impact.score).toBe(85);
    expect(impact.issues.map((i) => i.message)).toEqual([
      expect.stringContaining('starts with a duty'),
    ]);
  });

  it('asks to fill in placeholders left by the rewrite', () => {
    const { issues } = checkImpact({
      ...resume,
      workExperiences: [
        {
          ...resume.workExperiences[0],
          description: bullets('Grew signups by [X%] with a new onboarding'),
        },
      ],
    });
    expect(issues[0]).toMatchObject({
      severity: 'critical',
      examples: ['Grew signups by [X%] with a new onboarding'],
    });
  });

  it('marks a very short resume', () => {
    const { score, issues } = checkLength(resume);
    expect(score).toBe(30);
    expect(issues[0]?.severity).toBe('warning');
  });
});

describe('ResumeAtsService', () => {
  it('weights the criteria and trusts keywords written in the resume', async () => {
    const { service } = setup({
      targetRole: 'Backend Engineer',
      keywords: [
        { keyword: 'Go', present: true },
        // written in the resume, so present whatever the model says
        { keyword: 'TypeScript', present: false },
        { keyword: 'Kubernetes', present: false },
        { keyword: 'kubernetes', present: false },
        { keyword: 'PostgreSQL', present: false },
      ],
    });

    const result = await service.check(resume);

    expect(result.keywords).toEqual({
      targetRole: 'Backend Engineer',
      present: ['Go', 'TypeScript'],
      missing: ['Kubernetes', 'PostgreSQL'],
    });
    const scores = Object.fromEntries(
      result.criteria.map((c) => [c.key, c.score]),
    );
    expect(scores).toEqual({
      contact: 100,
      sections: 100,
      length: 30,
      impact: 85,
      keywords: 50,
    });
    // (100*10 + 100*20 + 30*15 + 85*30 + 50*25) / 100
    expect(result.overallScore).toBe(73);
    expect(result.issues[0]?.severity).not.toBe('tip');
  });

  it('scores without keywords when the model fails', async () => {
    const { service } = setup(new Error('overloaded'));

    const result = await service.check(resume);

    expect(result.keywords).toBeNull();
    expect(result.criteria.at(-1)?.score).toBeNull();
    // (100*10 + 100*20 + 30*15 + 85*30) / 75
    expect(result.overallScore).toBe(80);
  });
});
