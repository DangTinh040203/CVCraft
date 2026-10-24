import { Code, type LucideIcon, Shuffle, Users } from 'lucide-react';

import {
  type InterviewPace,
  type InterviewSettings,
  type InterviewType,
} from '@/types/interview.type';

export const INTERVIEW_TYPES: Array<{
  value: InterviewType;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    value: 'ALL',
    label: 'Mixed',
    description: 'Technical and behavioral',
    icon: Shuffle,
  },
  {
    value: 'TECHNICAL',
    label: 'Technical',
    description: 'Skills, design, problem solving',
    icon: Code,
  },
  {
    value: 'BEHAVIORAL',
    label: 'Behavioral',
    description: 'Past experience, STAR answers',
    icon: Users,
  },
];

/** Gemini's prebuilt voices; the interviewer introduces themselves by it. */
export const INTERVIEW_VOICES = [
  { value: 'Kore', label: 'Kore', tone: 'Firm' },
  { value: 'Zephyr', label: 'Zephyr', tone: 'Bright' },
  { value: 'Puck', label: 'Puck', tone: 'Upbeat' },
  { value: 'Charon', label: 'Charon', tone: 'Informative' },
  { value: 'Fenrir', label: 'Fenrir', tone: 'Excitable' },
  { value: 'Leda', label: 'Leda', tone: 'Youthful' },
  { value: 'Orus', label: 'Orus', tone: 'Firm' },
] as const;

export const INTERVIEW_LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Vietnamese', label: 'Vietnamese' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Chinese', label: 'Chinese (Mandarin)' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Hindi', label: 'Hindi' },
] as const;

export const INTERVIEW_PACES: Array<{ value: InterviewPace; label: string }> = [
  { value: 'SLOW', label: 'Slower' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'FAST', label: 'Faster' },
];

export const QUESTION_COUNT_MIN = 1;
export const QUESTION_COUNT_MAX = 10;

/** The server ends an interview after this long (Live audio is billed). */
export const INTERVIEW_TIME_LIMIT_SECONDS = 14 * 60;

export const DEFAULT_INTERVIEW_SETTINGS: InterviewSettings = {
  jobDescription: '',
  interviewType: 'ALL',
  questionCount: 5,
  voiceName: 'Kore',
  language: 'English',
  pace: 'NORMAL',
};

export const INTERVIEW_AUDIO = {
  /** What Gemini Live takes from the microphone. */
  inputSampleRate: 16_000,
  /** What it speaks in. */
  outputSampleRate: 24_000,
  /**
   * After the interviewer's audio ends, the mic stays closed this long so
   * the room's echo isn't taken for the candidate speaking.
   */
  echoCooldownMs: 300,
  workletUrl: '/worklets/pcm-capture.worklet.js',
} as const;
