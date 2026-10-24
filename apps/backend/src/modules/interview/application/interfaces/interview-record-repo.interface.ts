import {
  type InterviewStatus,
  type InterviewType,
} from '@/libs/databases/prisma/generated/enums';
import { type InterviewFeedback } from '@/modules/interview/domain';

export const INTERVIEW_RECORD_REPOSITORY_TOKEN = Symbol(
  'INTERVIEW_RECORD_REPOSITORY_TOKEN',
);

export interface CreateInterviewRecord {
  id: string;
  userId: string;
  interviewType: InterviewType;
  language: string;
  totalQuestions: number;
  jobDescription: string;
}

export interface FinishInterviewRecord {
  status: InterviewStatus;
  questionsAnswered: number;
  feedback?: InterviewFeedback;
}

/** The stored history of interviews: the daily limit counts it. */
export interface IInterviewRecordRepository {
  create(data: CreateInterviewRecord): Promise<void>;
  finish(id: string, data: FinishInterviewRecord): Promise<void>;
  /** Interviews started in the window, whatever became of them. */
  countSince(userId: string, since: Date): Promise<number>;
}
