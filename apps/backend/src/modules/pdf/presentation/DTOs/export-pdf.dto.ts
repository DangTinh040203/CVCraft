import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ExportPdfDto {
  @IsString({ message: 'Template key must be a string' })
  @IsNotEmpty({ message: 'Template key is required' })
  @MaxLength(100, { message: 'Template key must not exceed 100 characters' })
  templateKey: string;

  @IsObject({ message: 'Format must be an object' })
  @IsOptional()
  format?: Record<string, unknown> | null;

  // The resume as currently shown in the editor (may contain unsaved edits)
  @IsObject({ message: 'Resume must be an object' })
  resume: Record<string, unknown>;
}
