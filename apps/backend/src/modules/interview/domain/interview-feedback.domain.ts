import { type ConversationTurn } from '@/modules/interview/domain/interview-session.domain';

export type InterviewVerdict = 'PASS' | 'BORDERLINE' | 'FAIL';

export interface InterviewCriterion {
  key: string;
  name: string;
  weight: number;
  score: number;
  explanation: string;
}

export interface QuestionFeedback {
  questionNumber: number;
  question: string;
  score: number;
  feedback: string;
  suggestion: string;
}

/** The evaluation sent to the candidate when the interview ends. */
export interface InterviewFeedback {
  /** Weighted from the criteria, 0-100. */
  overallScore: number;
  verdict: InterviewVerdict;
  summary: string;
  criteria: InterviewCriterion[];
  questions: QuestionFeedback[];
  strengths: string[];
  improvements: string[];
  questionsAnswered: number;
  totalQuestions: number;
  durationSeconds: number;
  transcript: Array<Pick<ConversationTurn, 'role' | 'content'>>;
}
