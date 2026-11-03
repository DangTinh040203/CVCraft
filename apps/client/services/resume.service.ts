import { HttpService, type HttpServiceOptions } from '@/services/http.service';
import {
  type ApplicationEmailDraft,
  type WriteEmailPayload,
} from '@/types/application.type';
import {
  type AtsResult,
  type ResumeSharing,
  type RewritePayload,
} from '@/types/ats.type';
import { type MatchResult, type TailorChange } from '@/types/match.type';
import {
  type ParseResumeResponse,
  type Resume,
  type UpdateResumeDto,
} from '@/types/resume.type';

export class ResumeService extends HttpService {
  constructor(options?: HttpServiceOptions) {
    super(options);
  }

  async getResume(): Promise<Resume> {
    const { data } = await this.get<Resume>('/resumes');
    return data;
  }

  async updateResume(id: string, payload: UpdateResumeDto): Promise<Resume> {
    const { data } = await this.post<UpdateResumeDto, Resume>(
      `/resumes/${id}`,
      payload,
    );
    return data;
  }

  /** Reads a PDF resume with AI; the result isn't saved. */
  async parseResume(file: File): Promise<ParseResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.post<FormData, ParseResumeResponse>(
      '/resumes/parse',
      formData,
    );
    return data;
  }

  /** Reads a job description PDF; the text is shown for review. */
  async readJobDescription(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.post<FormData, { text: string }>(
      '/resumes/job-description',
      formData,
    );
    return data.text;
  }

  /** Scores the resume as the editor has it against a job description. */
  async matchResume(resume: Resume, jobDescription: string) {
    const { data } = await this.post<
      { resume: Resume; jobDescription: string },
      MatchResult
    >('/resumes/match', { resume, jobDescription });
    return data;
  }

  /**
   * Rewrites the fields that matter most for a job description, working in
   * its keywords where the resume backs them; nothing is saved.
   */
  async tailorResume(
    resume: Resume,
    jobDescription: string,
    keywords: string[],
  ) {
    const { data } = await this.post<
      { resume: Resume; jobDescription: string; keywords: string[] },
      { changes: TailorChange[] }
    >('/resumes/tailor', { resume, jobDescription, keywords });
    return data.changes;
  }

  /** Rewrites one field with AI (bullets or the summary); nothing is saved. */
  async rewriteText(payload: RewritePayload): Promise<string[]> {
    const { data } = await this.post<RewritePayload, { lines: string[] }>(
      '/resumes/rewrite',
      payload,
    );
    return data.lines;
  }

  /** Checks the resume as the editor has it for ATS readiness. */
  async checkAts(resume: Resume) {
    const { data } = await this.post<{ resume: Resume }, AtsResult>(
      '/resumes/ats-check',
      { resume },
    );
    return data;
  }

  /** Turns the public link on or off; `regenerate` replaces the link. */
  async updateSharing(
    id: string,
    payload: { enabled: boolean; regenerate?: boolean },
  ) {
    const { data } = await this.patch<typeof payload, ResumeSharing>(
      `/resumes/${id}/share`,
      payload,
    );
    return data;
  }

  /** Drafts the application email for a job description. */
  async writeApplicationEmail(payload: WriteEmailPayload) {
    const { data } = await this.post<WriteEmailPayload, ApplicationEmailDraft>(
      '/resumes/email',
      payload,
    );
    return data;
  }
}
