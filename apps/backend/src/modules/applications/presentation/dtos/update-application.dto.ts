import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { ApplicationStatus } from '@/libs/databases/prisma/generated/enums';

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(ApplicationStatus, { message: 'Unknown status' })
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Notes must not exceed 2000 characters' })
  notes?: string;
}
