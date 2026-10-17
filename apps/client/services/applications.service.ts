import { HttpService, type HttpServiceOptions } from '@/services/http.service';
import {
  type SendApplicationPayload,
  type SendQuota,
  type SentApplication,
} from '@/types/application.type';

export class ApplicationsService extends HttpService {
  constructor(options?: HttpServiceOptions) {
    super(options);
  }

  /** Recent sends and today's remaining quota. */
  async getApplications() {
    const { data } = await this.get<{
      items: SentApplication[];
      quota: SendQuota;
    }>('/applications');
    return data;
  }

  /** Emails the recruiter from CraftCV, with the resume attached. */
  async sendApplication(payload: SendApplicationPayload) {
    const { data } = await this.post<
      SendApplicationPayload,
      { application: SentApplication; quota: SendQuota }
    >('/applications/send', payload);
    return data;
  }
}
