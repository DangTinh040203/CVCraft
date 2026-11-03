import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { MatchResumeDto } from '@/modules/resume/presentation/dtos/match-resume.dto';

export class TailorResumeDto extends MatchResumeDto {
  // The match's missing keywords, to work in where the resume supports them
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  keywords?: string[];
}
