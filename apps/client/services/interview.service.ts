import { HttpService, type HttpServiceOptions } from '@/services/http.service';
import { type InterviewQuota } from '@/types/interview.type';

/** The interview itself runs over Socket.IO (`connectInterviewSocket`). */
export class InterviewService extends HttpService {
  constructor(options?: HttpServiceOptions) {
    super(options);
  }

  /** How many interviews the user can still start today. */
  async getQuota() {
    const { data } = await this.get<InterviewQuota>('/interviews/quota');
    return data;
  }
}
