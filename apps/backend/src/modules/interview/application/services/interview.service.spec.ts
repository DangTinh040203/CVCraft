import { HttpStatus } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';

import { InterviewType } from '@/libs/databases/prisma/generated/enums';
import {
  SILENCE_AFTER_NUDGE_TIMEOUT_MS,
  SILENCE_NUDGE_MESSAGE,
  SILENCE_SKIP_MESSAGE,
  SILENCE_TIMEOUT_MS,
  SKIPPED_ANSWER,
} from '@/modules/interview/application/constants';
import {
  type IInterviewRecordRepository,
  type LiveInterviewProvider,
  type LiveSessionCallbacks,
  type LiveTurn,
} from '@/modules/interview/application/interfaces';
import {
  type InterviewCallbacks,
  InterviewService,
  isMetaRequest,
} from '@/modules/interview/application/services/interview.service';

const input = {
  userId: 'u1',
  socketId: 's1',
  resume: { title: 'Jane Doe', subTitle: 'Engineer' },
  jobDescription: 'Backend engineer, Node.js, PostgreSQL',
  interviewType: InterviewType.TECHNICAL,
  questionCount: 2,
  voiceName: 'Kore',
  language: 'English',
  pace: 'NORMAL' as const,
};

function setup({ used = 0 } = {}) {
  let live!: LiveSessionCallbacks;
  const provider: jest.Mocked<LiveInterviewProvider> = {
    connect: jest.fn().mockImplementation((_config, callbacks) => {
      live = callbacks as LiveSessionCallbacks;
      return Promise.resolve('p1');
    }),
    sendAudio: jest.fn(),
    sendText: jest.fn(),
    disconnect: jest.fn().mockResolvedValue(undefined),
  };
  const records: jest.Mocked<IInterviewRecordRepository> = {
    create: jest.fn().mockResolvedValue(undefined),
    finish: jest.fn().mockResolvedValue(undefined),
    countSince: jest.fn().mockResolvedValue(used),
  };
  const config = { getOrThrow: () => 3 } as unknown as ConfigService;
  const callbacks: jest.Mocked<InterviewCallbacks> = {
    onAudio: jest.fn(),
    onTurnComplete: jest.fn(),
    onInterrupted: jest.fn(),
    onCaption: jest.fn(),
    onComplete: jest.fn(),
    onSessionLost: jest.fn(),
  };
  const service = new InterviewService(provider, records, config);
  return { service, provider, records, callbacks, live: () => live };
}

const turn = (turnIndex: number, extra: Partial<LiveTurn> = {}): LiveTurn => ({
  turnIndex,
  interviewerText: `Interviewer turn ${turnIndex}`,
  isNudge: false,
  ...extra,
});

describe('isMetaRequest', () => {
  it.each([
    'Can you repeat the question?',
    'Sorry, what was the question',
    "I didn't catch that",
    'Bạn có thể nhắc lại câu hỏi không?',
    'Tôi nghe không rõ',
  ])('detects "%s"', (text) => {
    expect(isMetaRequest(text)).toBe(true);
  });

  it('treats real (or long) answers as answers', () => {
    expect(isMetaRequest('I designed the payments service in Go')).toBe(false);
    expect(isMetaRequest('')).toBe(false);
    expect(isMetaRequest(`${'I would repeat the test. '.repeat(8)}`)).toBe(
      false,
    );
  });
});

describe('InterviewService', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('refuses to start past the daily limit, before opening a session', async () => {
    const { service, provider, callbacks } = setup({ used: 3 });
    await expect(service.start(input, callbacks)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
    expect(provider.connect).not.toHaveBeenCalled();
  });

  it('allows one interview per user at a time', async () => {
    const { service, callbacks } = setup();
    await service.start(input, callbacks);
    await expect(
      service.start({ ...input, socketId: 's2' }, callbacks),
    ).rejects.toMatchObject({ status: HttpStatus.CONFLICT });
  });

  it('builds the prompt from the resume text and records the interview', async () => {
    const { service, provider, records, callbacks } = setup();
    const session = await service.start(input, callbacks);
    const config = provider.connect.mock.calls[0][0];
    expect(config.systemInstruction).toContain('Name: Jane Doe');
    expect(config.systemInstruction).toContain('exactly 2 question(s)');
    expect(config.kickoff).toContain('Kore');
    expect(records.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: session.id, userId: 'u1' }),
    );
  });

  it('counts answers, not the greeting, repeats, nudges or noise', async () => {
    const { service, callbacks, live } = setup();
    const session = await service.start(input, callbacks);

    live().onTurnComplete(turn(1)); // greeting + Q1
    expect(session.questionsAnswered).toBe(0);
    expect(callbacks.onTurnComplete).toHaveBeenLastCalledWith({
      questionNumber: 1,
      totalQuestions: 2,
      interviewerText: 'Interviewer turn 1',
    });

    live().onTurnComplete(turn(2, { candidateText: 'Can you repeat that?' }));
    live().onTurnComplete(turn(3)); // echo: no speech
    live().onTurnComplete(turn(4, { isNudge: true }));
    expect(session.questionsAnswered).toBe(0);

    live().onTurnComplete(turn(5, { candidateText: 'I built an API' }));
    expect(session.questionsAnswered).toBe(1);
    // The answer comes before the interviewer's reply to it
    expect(session.conversation.slice(-2)).toMatchObject([
      { role: 'candidate', content: 'I built an API', wasNudged: true },
      { role: 'interviewer', content: 'Interviewer turn 5' },
    ]);
    expect(callbacks.onTurnComplete).toHaveBeenLastCalledWith({
      questionNumber: 2,
      totalQuestions: 2,
      interviewerText: 'Interviewer turn 5',
    });

    live().onTurnComplete(turn(6, { candidateText: 'With Postgres' }));
    expect(session.isFinished).toBe(true);
    expect(callbacks.onComplete).toHaveBeenCalledTimes(1);
  });

  it('reminds a silent candidate, then skips the question', async () => {
    const { service, provider, callbacks, live } = setup();
    const session = await service.start(input, callbacks);
    live().onTurnComplete(turn(1));

    service.handlePlaybackComplete(session.id);
    jest.advanceTimersByTime(SILENCE_TIMEOUT_MS);
    expect(provider.sendText).toHaveBeenCalledWith(
      'p1',
      SILENCE_NUDGE_MESSAGE,
      true,
    );

    live().onTurnComplete(turn(2, { isNudge: true }));
    service.handlePlaybackComplete(session.id);
    jest.advanceTimersByTime(SILENCE_AFTER_NUDGE_TIMEOUT_MS);
    expect(provider.sendText).toHaveBeenLastCalledWith(
      'p1',
      SILENCE_SKIP_MESSAGE,
    );

    // The interviewer moves on: the question counts, unanswered
    live().onTurnComplete(turn(3));
    expect(session.questionsAnswered).toBe(1);
    expect(session.conversation.at(-2)).toMatchObject({
      content: SKIPPED_ANSWER,
      wasSkipped: true,
    });
  });

  it('restarts the countdown while the candidate speaks', async () => {
    const { service, provider, callbacks, live } = setup();
    const session = await service.start(input, callbacks);
    service.handlePlaybackComplete(session.id);

    jest.advanceTimersByTime(SILENCE_TIMEOUT_MS - 1000);
    live().onCandidateSpeech();
    jest.advanceTimersByTime(SILENCE_TIMEOUT_MS - 1000);
    expect(provider.sendText).not.toHaveBeenCalled();
  });

  it('cancels without scoring, clearing timers and the Live session', async () => {
    const { service, provider, records, callbacks } = setup();
    const session = await service.start(input, callbacks);
    service.handlePlaybackComplete(session.id);

    await service.cancel(session.id);
    jest.advanceTimersByTime(SILENCE_TIMEOUT_MS * 2);
    expect(provider.sendText).not.toHaveBeenCalled();
    expect(provider.disconnect).toHaveBeenCalledWith('p1');
    expect(records.finish).toHaveBeenCalledWith(
      session.id,
      expect.objectContaining({ status: 'CANCELLED' }),
    );
    // Ending afterwards is a no-op
    await expect(service.end(session.id)).resolves.toBeNull();
  });

  it('ends once: a second end (or the time limit) gets nothing', async () => {
    const { service, callbacks } = setup();
    const session = await service.start(input, callbacks);
    await expect(service.end(session.id)).resolves.toBe(session);
    expect(session.status).toBe('COMPLETED');
    await expect(service.end(session.id)).resolves.toBeNull();
  });

  it('reports a lost session and frees the user for a new one', async () => {
    const { service, callbacks, live } = setup();
    await service.start(input, callbacks);
    live().onDisconnected('lost');
    expect(callbacks.onSessionLost).toHaveBeenCalledWith('lost');
    await expect(service.start(input, callbacks)).resolves.toBeDefined();
  });
});
