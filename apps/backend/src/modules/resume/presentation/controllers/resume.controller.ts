import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

import { CurrentDbUser } from '@/libs/decorators';
import { FileMagicBytesValidator } from '@/libs/pipes/file-magic-bytes.pipe';
import { extractPdfText } from '@/libs/utils/pdf-text.util';
import {
  ResumeMatchingService,
  ResumeParserService,
  ResumeService,
} from '@/modules/resume/application/services';
import {
  MatchResumeDto,
  UpdateResumeDto,
} from '@/modules/resume/presentation/dtos';
import { User } from '@/modules/user/domain';

@Controller('resumes')
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly resumeParserService: ResumeParserService,
    private readonly resumeMatchingService: ResumeMatchingService,
  ) {}

  @Get()
  findResume(@CurrentDbUser() user: User) {
    return this.resumeService.findByUserId(user.id);
  }

  // Declared before `/:id` so "parse" isn't taken for a resume id
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UseInterceptors(FileInterceptor('file'))
  @Post('/parse')
  async parse(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
      }),
      new FileMagicBytesValidator(['application/pdf']),
    )
    file: Express.Multer.File,
  ) {
    return this.resumeParserService.parse(file);
  }

  /** A job description PDF as text, for the user to check before matching. */
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseInterceptors(FileInterceptor('file'))
  @Post('/job-description')
  async readJobDescription(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
      }),
      new FileMagicBytesValidator(['application/pdf']),
    )
    file: Express.Multer.File,
  ) {
    return { text: (await extractPdfText(file.buffer)).trim() };
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/match')
  async match(@Body() payload: MatchResumeDto) {
    return this.resumeMatchingService.match(
      payload.resume,
      payload.jobDescription,
    );
  }

  @Get('/:id')
  async findById(@Param('id') id: string, @CurrentDbUser() user: User) {
    return this.resumeService.findById(id, user.id);
  }

  @Post('/:id')
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateResumeDto,
    @CurrentDbUser() user: User,
  ) {
    return this.resumeService.update(id, payload, user.id);
  }
}
