import { IsObject, IsString, MaxLength, MinLength } from 'class-validator';

export class MatchResumeDto {
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
}
