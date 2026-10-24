import { type LiveCallbacks, type LiveServerMessage } from '@google/genai';
import { type ConfigService } from '@nestjs/config';

import { type LiveSessionCallbacks } from '@/modules/interview/application/interfaces';
import { GeminiLiveAdapter } from '@/modules/interview/infrastructure/adapters/gemini-live.adapter';

const connections: Array<{
  callbacks: LiveCallbacks;
  session: {
    sendClientContent: jest.Mock;
    sendRealtimeInput: jest.Mock;
    close: jest.Mock;
  };
}> = [];

jest.mock('@google/genai', () => ({
  ...jest.requireActual('@google/genai'),
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    live: {
      connect: jest.fn().mockImplementation(({ callbacks }) => {
        const session = {
          sendClientContent: jest.fn(),
          sendRealtimeInput: jest.fn(),
          close: jest.fn(),
        };
        connections.push({ callbacks: callbacks as LiveCallbacks, session });
        return Promise.resolve(session);
      }),
    },
  })),
}));

const config = { get: () => 'key', getOrThrow: () => 'live-model' };
const flush = () => new Promise((resolve) => setImmediate(resolve));
const message = (m: Record<string, unknown>) =>
  m as unknown as LiveServerMessage;

function setup() {
  connections.length = 0;
  const callbacks: jest.Mocked<LiveSessionCallbacks> = {
    onAudio: jest.fn(),
    onTurnComplete: jest.fn(),
    onInterrupted: jest.fn(),
    onCandidateSpeech: jest.fn(),
    onInterviewerText: jest.fn(),
    onDisconnected: jest.fn(),
  };
  const adapter = new GeminiLiveAdapter(config as unknown as ConfigService);
  const liveConfig = {
    systemInstruction: 'Be an interviewer',
    voiceName: 'Kore',
    kickoff: 'Begin',
    resumeMessage: jest.fn().mockReturnValue('Resume where you left off'),
  };
  return { adapter, callbacks, liveConfig };
}

describe('GeminiLiveAdapter', () => {
  it('sends the kickoff once the session is set up', async () => {
    const { adapter, callbacks, liveConfig } = setup();
    await adapter.connect(liveConfig, callbacks);
    const { callbacks: live, session } = connections[0];

    live.onmessage(message({ setupComplete: {} }));
    await flush();
    expect(session.sendClientContent).toHaveBeenCalledWith({
      turns: [{ role: 'user', parts: [{ text: 'Begin' }] }],
    });
  });

  it('reports a turn with both transcripts, audio and the nudge flag', async () => {
    const { adapter, callbacks, liveConfig } = setup();
    const id = await adapter.connect(liveConfig, callbacks);
    const { callbacks: live } = connections[0];

    live.onmessage(
      message({ serverContent: { inputTranscription: { text: 'My ' } } }),
    );
    live.onmessage(
      message({ serverContent: { inputTranscription: { text: 'answer' } } }),
    );
    adapter.sendText(id, 'Nudge them', true);
    live.onmessage(
      message({
        serverContent: {
          outputTranscription: { text: 'Thanks.' },
          modelTurn: {
            parts: [
              { inlineData: { data: Buffer.from('ab').toString('base64') } },
            ],
          },
        },
      }),
    );
    live.onmessage(message({ serverContent: { turnComplete: true } }));

    expect(callbacks.onCandidateSpeech).toHaveBeenCalledTimes(2);
    expect(callbacks.onInterviewerText).toHaveBeenCalledWith('Thanks.');
    expect(callbacks.onAudio).toHaveBeenCalledWith(Buffer.from('ab'));
    expect(callbacks.onTurnComplete).toHaveBeenCalledWith({
      turnIndex: 1,
      interviewerText: 'Thanks.',
      candidateText: 'My answer',
      isNudge: true,
    });

    // Buffers and the flag are reset for the next turn
    live.onmessage(message({ serverContent: { turnComplete: true } }));
    expect(callbacks.onTurnComplete).toHaveBeenLastCalledWith({
      turnIndex: 2,
      interviewerText: undefined,
      candidateText: undefined,
      isNudge: false,
    });
  });

  it('reopens a dropped session and briefs it instead of greeting again', async () => {
    jest.useFakeTimers();
    const { adapter, callbacks, liveConfig } = setup();
    await adapter.connect(liveConfig, callbacks);
    const first = connections[0];
    first.callbacks.onmessage(message({ setupComplete: {} }));
    first.callbacks.onmessage(
      message({ serverContent: { turnComplete: true } }),
    );

    first.callbacks.onclose?.({ code: 1011, reason: 'boom' } as CloseEvent);
    await jest.advanceTimersByTimeAsync(2000);
    expect(connections).toHaveLength(2);

    const second = connections[1];
    second.callbacks.onmessage(message({ setupComplete: {} }));
    await jest.advanceTimersByTimeAsync(0);
    expect(second.session.sendClientContent).toHaveBeenCalledWith({
      turns: [{ role: 'user', parts: [{ text: 'Resume where you left off' }] }],
    });
    // Events from the replaced socket are ignored
    first.callbacks.onmessage(
      message({ serverContent: { turnComplete: true } }),
    );
    expect(callbacks.onTurnComplete).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('keeps the whole answer when the candidate talks over a reply', async () => {
    const { adapter, callbacks, liveConfig } = setup();
    await adapter.connect(liveConfig, callbacks);
    const { callbacks: live } = connections[0];

    live.onmessage(
      message({
        serverContent: { inputTranscription: { text: 'I built it, ' } },
      }),
    );
    // The interviewer started replying at a pause and was cut off
    live.onmessage(
      message({ serverContent: { outputTranscription: { text: 'Thank' } } }),
    );
    live.onmessage(message({ serverContent: { interrupted: true } }));
    live.onmessage(
      message({
        serverContent: { inputTranscription: { text: 'then scaled it.' } },
      }),
    );
    live.onmessage(
      message({ serverContent: { outputTranscription: { text: 'Great.' } } }),
    );
    live.onmessage(message({ serverContent: { turnComplete: true } }));

    expect(callbacks.onInterrupted).toHaveBeenCalledTimes(1);
    expect(callbacks.onTurnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        candidateText: 'I built it, then scaled it.',
        interviewerText: 'Great.',
      }),
    );
  });

  it('does not reconnect after an intentional disconnect', async () => {
    const { adapter, callbacks, liveConfig } = setup();
    const id = await adapter.connect(liveConfig, callbacks);
    await adapter.disconnect(id);
    connections[0].callbacks.onclose?.({
      code: 1000,
      reason: '',
    } as CloseEvent);
    expect(connections[0].session.close).toHaveBeenCalled();
    expect(connections).toHaveLength(1);
    expect(callbacks.onDisconnected).not.toHaveBeenCalled();
  });
});
