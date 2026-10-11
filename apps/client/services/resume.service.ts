import { HttpService, type HttpServiceOptions } from '@/services/http.service';
import { type Resume, type UpdateResumeDto } from '@/types/resume.type';

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
}
