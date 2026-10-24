export const LIVE_INTERVIEW_PROVIDER_TOKEN = Symbol(
  'LIVE_INTERVIEW_PROVIDER_TOKEN',
);

export interface LiveInterviewConfig {
  systemInstruction: string;
  /** Prebuilt voice; also how the interviewer introduces themselves. */
  voiceName: string;
  /** First message once the session is ready: the model doesn't speak first. */
  kickoff: string;
  /**
   * The message for a reopened session after the connection dropped. Called
   * at that moment, so it can carry the conversation so far.
   */
  resumeMessage: () => string;
}

export interface LiveTurn {
  /** 1-based count of the model's turns in this interview. */
  turnIndex: number;
  /** What the interviewer said (output transcription). */
  interviewerText?: string;
  /** What the candidate said since the previous turn (input transcription). */
  candidateText?: string;
  /** The answer to a silence reminder, not a new question. */
  isNudge: boolean;
}

/** Registered at connect, before the socket opens: Gemini can answer at once. */
export interface LiveSessionCallbacks {
  /** 16-bit PCM, 24 kHz mono. */
  onAudio(chunk: Buffer): void;
  onTurnComplete(turn: LiveTurn): void;
  /** The candidate spoke over the interviewer, who stopped. */
  onInterrupted(): void;
  /** The candidate is speaking (resets the silence timer). */
  onCandidateSpeech(): void;
  /** What the interviewer has said so far in this turn (live captions). */
  onInterviewerText(text: string): void;
  /** The session was lost and reconnecting failed. */
  onDisconnected(reason: string): void;
}

/** A real-time voice conversation with a model (port for GeminiLiveAdapter). */
export interface LiveInterviewProvider {
  /** Opens a session; resolves with its id. */
  connect(
    config: LiveInterviewConfig,
    callbacks: LiveSessionCallbacks,
  ): Promise<string>;
  /** 16-bit PCM, 16 kHz mono. */
  sendAudio(sessionId: string, pcm: Buffer): void;
  /**
   * A text instruction in the conversation. `asNudge` marks the turn it
   * prompts as a reminder, which isn't counted as a question.
   */
  sendText(sessionId: string, text: string, asNudge?: boolean): void;
  disconnect(sessionId: string): Promise<void>;
}
