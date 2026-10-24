import { InterviewType } from '@/libs/databases/prisma/generated/enums';
import {
  InterviewEvaluationService,
  verdictFor,
} from '@/modules/interview/application/services/interview-evaluation.service';
import { InterviewSession } from '@/modules/interview/domain';
import { type LlmService } from '@/modules/llm/application/services';

function session(answers: string[]) {
  const s = new InterviewSession({
    id: 'i1',
    userId: 'u1',
    socketId: 's1',
    jobDescription: 'Backend engineer',
    resumeText: 'Name: Jane',
    interviewType: InterviewType.TECHNICAL,
    language: 'English',
    totalQuestions: 3,
  });
  s.addTurn({ role: 'interviewer', content: 'Hi, tell me about APIs?' });
  for (const answer of answers) {
    s.recordAnswer({ content: answer });
    s.addTurn({ role: 'interviewer', content: 'Thanks. Next?' });
  }
  return s;
}

function setup(response: unknown) {
  const llm = {
    sendMessage: jest.fn().mockResolvedValue(JSON.stringify(response)),
  } as unknown as jest.Mocked<LlmService>;
  return { llm, service: new InterviewEvaluationService(llm) };
}

const criteria = (scores: number[]) =>
  [
    'technicalKnowledge',
    'communication',
    'problemSolving',
    'roleFit',
    'conduct',
  ].map((key, i) => ({ key, score: scores[i], explanation: 'why' }));

describe('verdictFor', () => {
  it('uses the 70 / 50 thresholds', () => {
    expect(verdictFor(70)).toBe('PASS');
    expect(verdictFor(69)).toBe('BORDERLINE');
    expect(verdictFor(50)).toBe('BORDERLINE');
    expect(verdictFor(49)).toBe('FAIL');
  });
});

describe('InterviewEvaluationService', () => {
  it('computes the overall score from the weighted criteria', async () => {
    const { service, llm } = setup({
      summary: 'Solid',
      // 80*.25 + 60*.2 + 70*.2 + 50*.15 + 90*.2 = 71.5
      criteria: criteria([80, 60, 70, 50, 90]),
      questions: [
        { question: 'APIs?', score: 75, feedback: 'ok', suggestion: 'more' },
        { question: 'DBs?', score: 65, feedback: 'ok', suggestion: 'more' },
      ],
      strengths: ['Clear', 'Clear', ''],
      improvements: ['Depth'],
    });
    const feedback = await service.evaluate(session(['REST', 'Postgres']));

    expect(feedback.overallScore).toBe(72);
    expect(feedback.verdict).toBe('PASS');
    expect(feedback.criteria.map((c) => c.weight)).toEqual([
      25, 20, 20, 15, 20,
    ]);
    expect(feedback.strengths).toEqual(['Clear']);
    expect(feedback.questions.map((q) => q.questionNumber)).toEqual([1, 2]);
    expect(feedback.questionsAnswered).toBe(2);
    expect(feedback.transcript).toHaveLength(5);
    expect(llm.sendMessage.mock.calls[0][2]).toMatchObject({
      temperature: 0,
    });
    expect(llm.sendMessage.mock.calls[0][0]).toContain('Candidate: REST');
  });

  it('clamps scores and fills criteria the model left out', async () => {
    const { service } = setup({
      summary: '',
      criteria: [{ key: 'communication', score: 140, explanation: '' }],
      questions: [],
      strengths: [],
      improvements: [],
    });
    const feedback = await service.evaluate(session(['x']));
    expect(feedback.criteria).toHaveLength(5);
    expect(feedback.criteria[1].score).toBe(100);
    expect(feedback.overallScore).toBe(20);
  });

  it('caps the score when most answers scored 0', async () => {
    const { service } = setup({
      summary: '',
      criteria: criteria([90, 90, 90, 90, 90]),
      questions: [
        { question: 'a', score: 0, feedback: '', suggestion: '' },
        { question: 'b', score: 0, feedback: '', suggestion: '' },
        { question: 'c', score: 80, feedback: '', suggestion: '' },
      ],
      strengths: [],
      improvements: [],
    });
    const feedback = await service.evaluate(session(['a', 'b', 'c']));
    expect(feedback.overallScore).toBe(20);
    expect(feedback.verdict).toBe('FAIL');
  });

  it('does not ask the model when nothing was answered', async () => {
    const { service, llm } = setup({});
    const feedback = await service.evaluate(session([]));
    expect(llm.sendMessage).not.toHaveBeenCalled();
    expect(feedback.overallScore).toBe(0);
    expect(feedback.questions).toEqual([]);
  });
});
