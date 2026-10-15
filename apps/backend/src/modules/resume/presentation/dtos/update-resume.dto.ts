import { PartialType } from '@nestjs/mapped-types';

import { CreateResumeDto } from '@/modules/resume/presentation/dtos/create-resume.dto';

export class UpdateResumeDto extends PartialType(CreateResumeDto) {}
