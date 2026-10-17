import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ExportPdfDto } from '@/modules/pdf/presentation/dtos';

export class SendApplicationDto {
  // One recipient per email: no lists, so this can't be used for bulk mail
  @IsEmail({}, { message: "Enter the recruiter's email address" })
  @MaxLength(254)
  to: string;

  @IsString()
  @MinLength(3, { message: 'Add a subject' })
  @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
  subject: string;

  @IsString()
  @MinLength(20, { message: 'The email body is too short' })
  @MaxLength(10000, { message: 'Email body must not exceed 10000 characters' })
  body: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  // The resume to attach, as for a PDF export
  @ValidateNested()
  @Type(() => ExportPdfDto)
  cv: ExportPdfDto;
}
