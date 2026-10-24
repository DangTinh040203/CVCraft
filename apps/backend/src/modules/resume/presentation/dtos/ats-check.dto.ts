import { IsObject } from 'class-validator';

export class AtsCheckDto {
  // The resume as the editor has it (unsaved edits included)
  @IsObject({ message: 'Resume must be an object' })
  resume: Record<string, unknown>;
}
