import {
  IsEnum,
  IsIn,
  IsInt,
  IsObject,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { InterviewType } from '@/libs/databases/prisma/generated/enums';
import {
  INTERVIEW_LANGUAGES,
  INTERVIEW_PACES,
  INTERVIEW_VOICES,
  type InterviewPace,
  QUESTION_COUNT_MAX,
  QUESTION_COUNT_MIN,
} from '@/modules/interview/application/constants';

export class StartInterviewDto {
  // The resume as the editor has it (unsaved edits included)
  @IsObject({ message: 'Resume must be an object' })
  resume: Record<string, unknown>;

  @IsString({ message: 'Job description must be text' })
  @MinLength(80, {
    message:
      'The job description looks too short. Paste the full posting (responsibilities and requirements).',
  })
  @MaxLength(20000, {
    message: 'Job description must not exceed 20000 characters',
  })
  jobDescription: string;

  @IsEnum(InterviewType, {
    message: 'Interview type must be TECHNICAL, BEHAVIORAL or ALL',
  })
  interviewType: InterviewType;

  @IsInt({ message: 'Question count must be a whole number' })
  @Min(QUESTION_COUNT_MIN)
  @Max(QUESTION_COUNT_MAX)
  questionCount: number;

  @IsIn(INTERVIEW_VOICES, { message: 'Pick one of the offered voices' })
  voiceName: string;

  @IsIn(INTERVIEW_LANGUAGES, { message: 'Pick one of the offered languages' })
  language: string;

  @IsIn(INTERVIEW_PACES, { message: 'Pace must be SLOW, NORMAL or FAST' })
  pace: InterviewPace;
}
