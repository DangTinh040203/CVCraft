import {
  InterviewStatus,
  type InterviewType,
} from '@/libs/databases/prisma/generated/enums';

export interface ConversationTurn {
  role: 'interviewer' | 'candidate';
  content: string;
  /** The candidate needed a reminder before answering. */
  wasNudged?: boolean;
  /** The candidate stayed silent and the question was skipped. */
  wasSkipped?: boolean;
}

/**
 * A live interview while it runs (held in memory): the transcript and how
 * many questions have been answered.
 */
export class InterviewSession {
  id: string;
  userId: string;
  socketId: string;
  jobDescription: string;
  /** The resume as plain text, as the interviewer sees it. */
  resumeText: string;
  interviewType: InterviewType;
  language: string;
  totalQuestions: number;
  questionsAnswered = 0;
  status: InterviewStatus = InterviewStatus.IN_PROGRESS;
  conversation: ConversationTurn[] = [];
  providerSessionId: string | null = null;
  startedAt = new Date();

  constructor(
    partial: Pick<
      InterviewSession,
      | 'id'
      | 'userId'
      | 'socketId'
      | 'jobDescription'
      | 'resumeText'
      | 'interviewType'
      | 'language'
      | 'totalQuestions'
    >,
  ) {
    Object.assign(this, partial);
  }

  get isFinished(): boolean {
    return this.questionsAnswered >= this.totalQuestions;
  }

  get durationSeconds(): number {
    return Math.round((Date.now() - this.startedAt.getTime()) / 1000);
  }

  addTurn(turn: ConversationTurn): void {
    this.conversation.push(turn);
  }

  recordAnswer(turn: Omit<ConversationTurn, 'role'>): void {
    this.questionsAnswered++;
    this.addTurn({ role: 'candidate', ...turn });
  }

  complete(): void {
    this.status = InterviewStatus.COMPLETED;
  }

  cancel(): void {
    this.status = InterviewStatus.CANCELLED;
  }
}
