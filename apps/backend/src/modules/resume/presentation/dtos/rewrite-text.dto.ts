import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  REWRITE_KINDS,
  type RewriteKind,
} from '@/modules/resume/application/constants/resume-rewrite.constant';

export class RewriteTextDto {
  @IsIn(REWRITE_KINDS)
  kind: RewriteKind;

  // The field as the editor has it (HTML)
  @IsString({ message: 'Text must be a string' })
  @MaxLength(8000, { message: 'This text is too long to rewrite at once' })
  text: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  organization?: string;

  @IsOptional()
  @IsBoolean()
  current?: boolean;
}
