import {
  EndSensitivity,
  GoogleGenAI,
  type LiveConnectConfig,
  type LiveServerMessage,
  Modality,
  type Session,
} from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { Env } from '@/libs/configs/env.config';
import {
  type LiveInterviewConfig,
  type LiveInterviewProvider,
  type LiveSessionCallbacks,
} from '@/modules/interview/application/interfaces';

/** Reopening a dropped session: tries, waiting 2 s then 4 s. */
const RECONNECT_DELAYS_MS = [2000, 4000];

interface SessionState {
  config: LiveInterviewConfig;
  callbacks: LiveSessionCallbacks;
  /** The current connection, resolved once its socket is open. */
  session: Promise<Session>;
  /** Bumped on every (re)connect, so events of a replaced socket are ignored. */
  generation: number;
  /** The kickoff (or resume message) went out on this connection. */
  started: boolean;
  turnCount: number;
  /** The turn being generated answers a silence reminder. */
  pendingNudge: boolean;
  interviewerText: string;
  candidateText: string;
  reconnecting: boolean;
  closing: boolean;
}

const describe = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Gemini Live (native audio) as the interviewer: streams the candidate's
 * microphone in, the spoken questions out, and reports each finished turn
 * with both sides' transcripts. A session that drops is reopened with the
 * conversation so far.
 */
@Injectable()
export class GeminiLiveAdapter implements LiveInterviewProvider {
  private readonly logger = new Logger(GeminiLiveAdapter.name);
  private readonly genAI: GoogleGenAI;
  private readonly model: string;
  private readonly sessions = new Map<string, SessionState>();

  constructor(configService: ConfigService) {
    this.genAI = new GoogleGenAI({
      apiKey: configService.get<string>(Env.GEMINI_API_KEY),
    });
    this.model = configService.getOrThrow<string>(Env.GEMINI_LIVE_MODEL);
  }

  async connect(
    config: LiveInterviewConfig,
    callbacks: LiveSessionCallbacks,
  ): Promise<string> {
    const id = randomUUID();
    const state: SessionState = {
      config,
      callbacks,
      session: Promise.resolve(null as unknown as Session),
      generation: 0,
      started: false,
      turnCount: 0,
      pendingNudge: false,
      interviewerText: '',
      candidateText: '',
      reconnecting: false,
      closing: false,
    };
    this.sessions.set(id, state);
    try {
      await this.open(id, state);
      return id;
    } catch (error) {
      this.sessions.delete(id);
      throw error;
    }
  }

  sendAudio(id: string, pcm: Buffer): void {
    const state = this.sessions.get(id);
    // Audio while reconnecting is dropped: the candidate is told to wait
    if (!state || state.reconnecting) return;
    void state.session
      .then((session) =>
        session.sendRealtimeInput({
          audio: {
            data: pcm.toString('base64'),
            mimeType: 'audio/pcm;rate=16000',
          },
        }),
      )
      .catch(() => undefined);
  }

  sendText(id: string, text: string, asNudge = false): void {
    const state = this.sessions.get(id);
    if (!state || state.reconnecting) return;
    state.pendingNudge = asNudge;
    this.sendTurn(id, state, text);
  }

  async disconnect(id: string): Promise<void> {
    const state = this.sessions.get(id);
    if (!state) return;
    state.closing = true;
    this.sessions.delete(id);
    try {
      (await state.session).close();
    } catch (error) {
      this.logger.warn(`Closing Live session ${id} failed: ${describe(error)}`);
    }
  }

  private open(id: string, state: SessionState): Promise<Session> {
    const generation = ++state.generation;
    const current = () =>
      this.sessions.get(id) === state && state.generation === generation;

    const liveConfig: LiveConnectConfig = {
      responseModalities: [Modality.AUDIO],
      systemInstruction: state.config.systemInstruction,
      outputAudioTranscription: {},
      inputAudioTranscription: {},
      // Candidates pause to think: end their turn only after 2 s of silence
      realtimeInputConfig: {
        automaticActivityDetection: {
          endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
          silenceDurationMs: 2000,
        },
      },
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: state.config.voiceName },
        },
      },
    };

    state.started = false;
    // Assigned before any message can arrive (they come asynchronously), so
    // the kickoff sent on setupComplete waits for this very connection
    state.session = this.genAI.live.connect({
      model: this.model,
      config: liveConfig,
      callbacks: {
        onmessage: (message) => {
          if (current()) this.handleMessage(id, state, message);
        },
        onerror: (event) => {
          if (current()) {
            this.logger.warn(`Live session ${id} error: ${event.message}`);
          }
        },
        onclose: (event) => {
          if (!current() || state.closing) return;
          this.logger.warn(
            `Live session ${id} closed unexpectedly (${event.code}: ${event.reason || 'no reason'})`,
          );
          void this.reconnect(id, state);
        },
      },
    });
    return state.session;
  }

  private handleMessage(
    id: string,
    state: SessionState,
    message: LiveServerMessage,
  ) {
    if (message.setupComplete && !state.started) {
      state.started = true;
      // A reopened session has no memory of the interview: brief it
      this.sendTurn(
        id,
        state,
        state.turnCount > 0
          ? state.config.resumeMessage()
          : state.config.kickoff,
      );
      return;
    }

    const content = message.serverContent;
    if (!content) return;

    if (content.interrupted) {
      // Only the interviewer's cut-off reply is dropped: the candidate kept
      // talking, and what they said before is still part of their answer
      state.interviewerText = '';
      state.callbacks.onInterrupted();
      return;
    }

    if (content.outputTranscription?.text) {
      state.interviewerText += content.outputTranscription.text;
      state.callbacks.onInterviewerText(state.interviewerText.trim());
    }
    if (content.inputTranscription?.text) {
      state.candidateText += content.inputTranscription.text;
      state.callbacks.onCandidateSpeech();
    }
    for (const part of content.modelTurn?.parts ?? []) {
      if (part.inlineData?.data) {
        state.callbacks.onAudio(Buffer.from(part.inlineData.data, 'base64'));
      }
    }

    if (content.turnComplete) {
      state.turnCount++;
      const turn = {
        turnIndex: state.turnCount,
        interviewerText: state.interviewerText.trim() || undefined,
        candidateText: state.candidateText.trim() || undefined,
        isNudge: state.pendingNudge,
      };
      state.interviewerText = '';
      state.candidateText = '';
      state.pendingNudge = false;
      state.callbacks.onTurnComplete(turn);
    }
  }

  private sendTurn(id: string, state: SessionState, text: string) {
    void state.session
      .then((session) =>
        session.sendClientContent({
          turns: [{ role: 'user', parts: [{ text }] }],
        }),
      )
      .catch((error: unknown) =>
        this.logger.warn(
          `Sending text to Live session ${id} failed: ${describe(error)}`,
        ),
      );
  }

  private async reconnect(id: string, state: SessionState) {
    if (state.reconnecting) return;
    state.reconnecting = true;
    state.interviewerText = '';
    state.candidateText = '';
    state.pendingNudge = false;

    for (const delay of RECONNECT_DELAYS_MS) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (state.closing) return;
      try {
        await this.open(id, state);
        state.reconnecting = false;
        this.logger.log(`Live session ${id} reconnected`);
        return;
      } catch (error) {
        this.logger.warn(
          `Reconnecting Live session ${id} failed: ${describe(error)}`,
        );
      }
    }

    this.sessions.delete(id);
    state.callbacks.onDisconnected(
      'The connection to the interviewer was lost. Please start again.',
    );
  }
}
