import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSharingDto {
  @IsBoolean()
  enabled: boolean;

  // A new link; the old one stops working
  @IsOptional()
  @IsBoolean()
  regenerate?: boolean;
}
