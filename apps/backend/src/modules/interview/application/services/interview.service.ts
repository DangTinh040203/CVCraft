import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { Env } from '@/libs/configs/env.config';
import { type InterviewType } from '@/libs/databases/prisma/generated/enums';
import { PromptSanitizer } from '@/libs/utils/prompt-sanitizer.util';
import {
  INTERVIEW_QUOTA_WINDOW_MS,
  type InterviewPace,
  interviewSystemPrompt,
  kickoffMessage,
  MAX_INTERVIEW_MS,
  resumeAfterReconnectMessage,
  SILENCE_AFTER_NUDGE_TIMEOUT_MS,
  SILENCE_NUDGE_MESSAGE,
  SILENCE_SKIP_MESSAGE,
  SILENCE_TIMEOUT_MS,
  SKIPPED_ANSWER,
} from '@/modules/interview/application/constants';
import {
  type IInterviewRecordRepository,
  INTERVIEW_RECORD_REPOSITORY_TOKEN,
  LIVE_INTERVIEW_PROVIDER_TOKEN,
  type LiveInterviewProvider,
  type LiveTurn,
} from '@/modules/interview/application/interfaces';
import {
  type ConversationTurn,
  type InterviewFeedback,
  InterviewSession,
} from '@/modules/interview/domain';
import { resumeToText } from '@/modules/resume/application/services/resume-matching.service';

export interface StartInterviewInput {
  userId: string;
  socketId: string;
  /** The resume as the editor has it (unsaved edits included). */
  resume: Record<string, unknown>;
  jobDescription: string;
  interviewType: InterviewType;
  questionCount: number;
  voiceName: string;
  language: string;
  pace: InterviewPace;
}

/** How the running interview reaches the candidate (the gateway emits). */
export interface InterviewCallbacks {
  onAudio(chunk: Buffer): void;
  /**
   * The interviewer finished a turn (all its audio was sent): progress, and
   * what they said, for captions.
   */
  onTurnComplete(turn: InterviewTurnUpdate): void;
  onInterrupted(): void;
  /** The interviewer's words so far in the current turn, as they speak. */
  onCaption(text: string): void;
  /** Every question answered, or the time limit reached: evaluate now. */
  onComplete(): void;
  onSessionLost(message: string): void;
}

export interface InterviewTurnUpdate {
  /** The question being asked now (1-based). */
  questionNumber: number;
  totalQuestions: number;
  interviewerText: string | null;
}

export interface InterviewQuota {
  limit: number;
  used: number;
  remaining: number;
}

interface LiveState {
  session: InterviewSession;
  callbacks: InterviewCallbacks;
  silenceTimer?: NodeJS.Timeout;
  /** The candidate was reminded once for the current question. */
  nudged: boolean;
  timeLimit: NodeJS.Timeout;
}

/** Short "can you repeat that?" requests, in English and Vietnamese. */
const META_REQUEST_PATTERNS = [
  /\brepeat\b/,
  /\bsay\s+(that\s+)?again\b/,
  /\brephrase\b/,
  /\b(one\s+more\s+time|once\s+more|come\s+again|pardon)\b/,
  /\b(can|could)\s+you\s+(repeat|say|ask)\b/,
  /\bwhat\s+(was|is)\s+the\s+question\b/,
  /\b(didn'?t|couldn'?t)\s+(hear|catch|understand|get)\b/,
  /\bsorry\s*[,.]?\s*(what|can|could|i\s+didn)\b/,
  /(nhắc|lặp|nói|đọc|hỏi)\s*lại/,
  /nghe\s*không\s*rõ/,
  /không\s*nghe\s*(rõ|được|thấy)/,
  /chưa\s*nghe/,
  /câu\s*hỏi\s*(là\s*)?(gì|j)\b/,
];

/**
 * Whether the candidate only asked to hear the question again: that turn
 * isn't an answer. A long reply that happens to say "repeat" still is.
 */
export function isMetaRequest(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized || normalized.length > 150) return false;
  return META_REQUEST_PATTERNS.some((pattern) => pattern.test(normalized));
}

/** The conversation as "Interviewer: ..." / "Candidate: ..." lines. */
export function formatTranscript(turns: ConversationTurn[]): string {
  return turns
    .map((turn) => {
      const marks = [
        turn.wasNudged && 'Nudged',
        turn.wasSkipped && 'Skipped',
      ].filter(Boolean);
      const role = turn.role === 'interviewer' ? 'Interviewer' : 'Candidate';
      return `${role}: ${turn.content}${marks.length ? ` [${marks.join(', ')}]` : ''}`;
    })
    .join('\n');
}

/**
 * Runs voice mock interviews: one Live session per interview, held in memory
 * (so a single backend instance serves them). Counts answered questions from
 * the turns, reminds a silent candidate and then moves on, and ends the
 * interview when every question is answered or time is up.
 */
@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);
  private readonly running = new Map<string, LiveState>();
  private readonly dailyLimit: number;

  constructor(
    @Inject(LIVE_INTERVIEW_PROVIDER_TOKEN)
    private readonly provider: LiveInterviewProvider,
    @Inject(INTERVIEW_RECORD_REPOSITORY_TOKEN)
    private readonly records: IInterviewRecordRepository,
    configService: ConfigService,
  ) {
    this.dailyLimit = configService.getOrThrow<number>(
      Env.INTERVIEW_DAILY_LIMIT_PER_USER,
    );
  }

  async quota(userId: string): Promise<InterviewQuota> {
    const used = await this.records.countSince(
      userId,
      new Date(Date.now() - INTERVIEW_QUOTA_WINDOW_MS),
    );
    return {
      limit: this.dailyLimit,
      used,
      remaining: Math.max(0, this.dailyLimit - used),
    };
  }

  async start(
    input: StartInterviewInput,
    callbacks: InterviewCallbacks,
  ): Promise<InterviewSession> {
    if (
      [...this.running.values()].some((r) => r.session.userId === input.userId)
    ) {
      throw new ConflictException(
        'You already have an interview in progress, maybe in another tab.',
      );
    }
    // Checked before opening the (billed) Live session
    const quota = await this.quota(input.userId);
    if (quota.remaining === 0) {
      throw new HttpException(
        `You can start ${quota.limit} interviews per 24 hours. Please try again later.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const session = new InterviewSession({
      id: randomUUID(),
      userId: input.userId,
      socketId: input.socketId,
      jobDescription: input.jobDescription.trim(),
      resumeText: resumeToText(input.resume),
      interviewType: input.interviewType,
      language: input.language,
      totalQuestions: input.questionCount,
    });

    const providerSessionId = await this.provider.connect(
      {
        systemInstruction: interviewSystemPrompt({
          resume: PromptSanitizer.sanitize(session.resumeText),
          jobDescription: PromptSanitizer.sanitize(session.jobDescription),
          interviewType: session.interviewType,
          totalQuestions: session.totalQuestions,
          language: session.language,
          interviewerName: input.voiceName,
          pace: input.pace,
        }),
        voiceName: input.voiceName,
        kickoff: kickoffMessage(input.voiceName),
        resumeMessage: () =>
          resumeAfterReconnectMessage(
            session.questionsAnswered,
            PromptSanitizer.sanitizeLight(
              formatTranscript(session.conversation),
            ),
          ),
      },
      {
        onAudio: (chunk) => callbacks.onAudio(chunk),
        onTurnComplete: (turn) => this.handleTurn(session.id, turn),
        onInterrupted: () => {
          const state = this.running.get(session.id);
          if (state) this.clearSilenceTimer(state);
          callbacks.onInterrupted();
        },
        onInterviewerText: (text) => callbacks.onCaption(text),
        onCandidateSpeech: () => {
          // Still talking: restart the countdown rather than nudging them
          const state = this.running.get(session.id);
          if (state?.silenceTimer) this.startSilenceTimer(state);
        },
        onDisconnected: (reason) => {
          const state = this.running.get(session.id);
          if (!state) return;
          this.stopTimers(state);
          this.running.delete(session.id);
          session.cancel();
          void this.saveRecord(session);
          callbacks.onSessionLost(reason);
        },
      },
    );
    session.providerSessionId = providerSessionId;

    try {
      await this.records.create({
        id: session.id,
        userId: session.userId,
        interviewType: session.interviewType,
        language: session.language,
        totalQuestions: session.totalQuestions,
        jobDescription: session.jobDescription,
      });
    } catch (error) {
      await this.provider.disconnect(providerSessionId);
      throw error;
    }

    this.running.set(session.id, {
      session,
      callbacks,
      nudged: false,
      timeLimit: setTimeout(() => {
        this.logger.log(`Interview ${session.id} reached the time limit`);
        callbacks.onComplete();
      }, MAX_INTERVIEW_MS),
    });
    this.logger.log(
      `Interview ${session.id} started (${session.interviewType}, ${session.totalQuestions} questions)`,
    );
    return session;
  }

  handleAudio(sessionId: string, pcm: Buffer): void {
    const state = this.running.get(sessionId);
    if (state?.session.providerSessionId) {
      this.provider.sendAudio(state.session.providerSessionId, pcm);
    }
  }

  /**
   * The candidate's browser finished playing the interviewer's turn: the
   * silence countdown starts now, not when the audio was sent (much sooner).
   */
  handlePlaybackComplete(sessionId: string): void {
    const state = this.running.get(sessionId);
    if (state && !state.session.isFinished) this.startSilenceTimer(state);
  }

  /**
   * Stops the live part; the session is returned for evaluation. Null when
   * it already ended (a second stop, or the time limit racing a stop).
   */
  async end(sessionId: string): Promise<InterviewSession | null> {
    const state = this.running.get(sessionId);
    if (!state) return null;
    this.running.delete(sessionId);
    this.stopTimers(state);
    state.session.complete();
    await this.disconnect(state.session);
    this.logger.log(
      `Interview ${sessionId} ended (${state.session.questionsAnswered}/${state.session.totalQuestions} answered)`,
    );
    return state.session;
  }

  /** The candidate left (closed the tab, lost the connection): not scored. */
  async cancel(sessionId: string): Promise<void> {
    const state = this.running.get(sessionId);
    if (!state) return;
    this.running.delete(sessionId);
    this.stopTimers(state);
    state.session.cancel();
    await this.disconnect(state.session);
    await this.saveRecord(state.session);
    this.logger.log(`Interview ${sessionId} cancelled`);
  }

  /** Stores the outcome; a failure is logged, the candidate still gets it. */
  async saveRecord(
    session: InterviewSession,
    feedback?: InterviewFeedback,
  ): Promise<void> {
    try {
      await this.records.finish(session.id, {
        status: session.status,
        questionsAnswered: session.questionsAnswered,
        feedback,
      });
    } catch (error) {
      this.logger.error(
        `Saving interview ${session.id} failed`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Turn 1 is the greeting and first question. Every later turn follows the
   * candidate's answer to the previous question, except reminders (nudges),
   * "please repeat" requests and turns set off by noise without speech.
   */
  private handleTurn(sessionId: string, turn: LiveTurn) {
    const state = this.running.get(sessionId);
    if (!state) return;
    const { session } = state;

    if (turn.isNudge) {
      // The countdown restarts (shorter) once this reminder has played
      state.nudged = true;
    } else {
      // The candidate spoke before this turn: their words come first
      this.recordCandidateTurn(state, turn);
    }
    if (turn.interviewerText) {
      session.addTurn({ role: 'interviewer', content: turn.interviewerText });
    }

    state.callbacks.onTurnComplete({
      questionNumber: Math.min(
        session.questionsAnswered + 1,
        session.totalQuestions,
      ),
      totalQuestions: session.totalQuestions,
      interviewerText: turn.interviewerText ?? null,
    });

    if (session.isFinished) {
      this.stopTimers(state);
      state.callbacks.onComplete();
    }
  }

  private recordCandidateTurn(state: LiveState, turn: LiveTurn) {
    const { session } = state;
    const wasNudged = state.nudged;
    state.nudged = false;

    if (turn.turnIndex > 1) {
      const answer = turn.candidateText?.trim() ?? '';
      if (isMetaRequest(answer)) {
        session.addTurn({
          role: 'candidate',
          content: `[Asked to repeat] ${answer}`,
        });
      } else if (answer || wasNudged) {
        // Silent after a reminder: the interviewer moved on (skip message)
        session.recordAnswer({
          content: answer || SKIPPED_ANSWER,
          wasNudged,
          wasSkipped: !answer,
        });
      }
      // else: echo or noise triggered a turn, nothing was answered
    }
  }

  private startSilenceTimer(state: LiveState) {
    this.clearSilenceTimer(state);
    const { session } = state;
    const afterNudge = state.nudged;
    state.silenceTimer = setTimeout(
      () => {
        state.silenceTimer = undefined;
        if (!session.providerSessionId || !this.running.has(session.id)) return;
        if (afterNudge) {
          // Counted as a (skipped) answer: not sent as a nudge
          this.provider.sendText(
            session.providerSessionId,
            SILENCE_SKIP_MESSAGE,
          );
        } else {
          this.provider.sendText(
            session.providerSessionId,
            SILENCE_NUDGE_MESSAGE,
            true,
          );
        }
      },
      afterNudge ? SILENCE_AFTER_NUDGE_TIMEOUT_MS : SILENCE_TIMEOUT_MS,
    );
  }

  private clearSilenceTimer(state: LiveState) {
    clearTimeout(state.silenceTimer);
    state.silenceTimer = undefined;
  }

  private stopTimers(state: LiveState) {
    this.clearSilenceTimer(state);
    clearTimeout(state.timeLimit);
  }

  private async disconnect(session: InterviewSession) {
    if (session.providerSessionId) {
      await this.provider.disconnect(session.providerSessionId);
    }
  }
}
