import { type Resume } from '@/types/resume.type';

export type InterviewType = 'TECHNICAL' | 'BEHAVIORAL' | 'ALL';
export type InterviewPace = 'SLOW' | 'NORMAL' | 'FAST';
export type InterviewVerdict = 'PASS' | 'BORDERLINE' | 'FAIL';

/** Where the interview is, as the sheet shows it. */
export type InterviewPhase =
  'setup' | 'connecting' | 'live' | 'evaluating' | 'result';

export interface InterviewSettings {
  jobDescription: string;
  interviewType: InterviewType;
  questionCount: number;
  voiceName: string;
  language: string;
  pace: InterviewPace;
}

export interface StartInterviewPayload extends InterviewSettings {
  resume: Resume;
}

export interface InterviewTurnUpdate {
  questionNumber: number;
  totalQuestions: number;
  interviewerText: string | null;
}

export interface InterviewCriterion {
  key: string;
  name: string;
  weight: number;
  score: number;
  explanation: string;
}

export interface InterviewQuestionFeedback {
  questionNumber: number;
  question: string;
  score: number;
  feedback: string;
  suggestion: string;
}

export interface InterviewFeedback {
  overallScore: number;
  verdict: InterviewVerdict;
  summary: string;
  criteria: InterviewCriterion[];
  questions: InterviewQuestionFeedback[];
  strengths: string[];
  improvements: string[];
  questionsAnswered: number;
  totalQuestions: number;
  durationSeconds: number;
  transcript: Array<{ role: 'interviewer' | 'candidate'; content: string }>;
}

export interface InterviewQuota {
  limit: number;
  used: number;
  remaining: number;
}

/** Socket.IO events, server to client. */
export interface InterviewServerEvents {
  'interview:started': (data: {
    sessionId: string;
    totalQuestions: number;
  }) => void;
  /** 16-bit PCM, 24 kHz mono. */
  'interview:audio': (chunk: ArrayBuffer) => void;
  'interview:turn-complete': (turn: InterviewTurnUpdate) => void;
  /** The interviewer's words so far in the current turn. */
  'interview:caption': (data: { text: string }) => void;
  'interview:interrupted': () => void;
  'interview:evaluating': () => void;
  'interview:feedback': (feedback: InterviewFeedback) => void;
  'interview:session-lost': (data: { message: string }) => void;
  'interview:error': (data: { message: string }) => void;
}

/** Socket.IO events, client to server. */
export interface InterviewClientEvents {
  'interview:start': (payload: StartInterviewPayload) => void;
  /** 16-bit PCM, 16 kHz mono. */
  'interview:audio': (chunk: ArrayBuffer) => void;
  'interview:playback-complete': () => void;
  'interview:stop': () => void;
}
