import { HttpService, type HttpServiceOptions } from '@/services/http.service';
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
}
