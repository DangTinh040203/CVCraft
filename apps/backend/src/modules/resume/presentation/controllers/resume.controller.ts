import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
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
  ResumeAtsService,
  ResumeEmailService,
  ResumeMatchingService,
  ResumeParserService,
  ResumeRewriteService,
  ResumeService,
  ResumeTailorService,
} from '@/modules/resume/application/services';
import {
  AtsCheckDto,
  MatchResumeDto,
  RewriteTextDto,
  TailorResumeDto,
  UpdateResumeDto,
  UpdateSharingDto,
  WriteEmailDto,
} from '@/modules/resume/presentation/dtos';
import { User } from '@/modules/user/domain';

@Controller('resumes')
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly resumeParserService: ResumeParserService,
    private readonly resumeMatchingService: ResumeMatchingService,
    private readonly resumeEmailService: ResumeEmailService,
    private readonly resumeRewriteService: ResumeRewriteService,
    private readonly resumeTailorService: ResumeTailorService,
    private readonly resumeAtsService: ResumeAtsService,
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

  /** Drafts the application email for a job; sending is in ApplicationsModule. */
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('/email')
  async writeEmail(@Body() payload: WriteEmailDto) {
    return this.resumeEmailService.write(payload);
  }

  /** Rewrites one field (job bullets, the summary); nothing is saved. */
  @Throttle({ default: { ttl: 60000, limit: 15 } })
  @Post('/rewrite')
  async rewrite(@Body() payload: RewriteTextDto) {
    return this.resumeRewriteService.rewrite(payload);
  }

  /** Rewrites the fields that matter most for a job; nothing is saved. */
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/tailor')
  async tailor(@Body() payload: TailorResumeDto) {
    return this.resumeTailorService.tailor(
      payload.resume,
      payload.jobDescription,
      payload.keywords,
    );
  }

  /** Scores the editor's resume for ATS readiness, without a job description. */
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/ats-check')
  async atsCheck(@Body() payload: AtsCheckDto) {
    return this.resumeAtsService.check(payload.resume);
  }

  @Get('/:id')
  async findById(@Param('id') id: string, @CurrentDbUser() user: User) {
    return this.resumeService.findById(id, user.id);
  }

  /** Turns the resume's public link on or off (or replaces it). */
  @Patch('/:id/share')
  async updateSharing(
    @Param('id') id: string,
    @Body() payload: UpdateSharingDto,
    @CurrentDbUser() user: User,
  ) {
    return this.resumeService.updateSharing(id, user.id, payload);
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
