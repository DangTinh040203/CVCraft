import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  EMAIL_TONES,
  type EmailTone,
} from '@/modules/resume/application/constants/resume-email.constant';

class EmailMatchContextDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  jobTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  strengths?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  matchedKeywords?: string[];
}

export class WriteEmailDto {
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

  @IsIn(Object.keys(EMAIL_TONES), { message: 'Unknown tone' })
  tone: EmailTone;

  // The salutation line to open with, e.g. "Dear Ms. Lee,"
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Greeting is too long' })
  greeting?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailMatchContextDto)
  match?: EmailMatchContextDto;
}
