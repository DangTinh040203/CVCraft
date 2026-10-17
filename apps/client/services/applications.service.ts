import { HttpService, type HttpServiceOptions } from '@/services/http.service';
import {
  type ApplicationsPage,
  type ApplicationsQuery,
  type SendApplicationPayload,
  type SendQuota,
  type SentApplication,
  type UpdateApplicationPayload,
} from '@/types/application.type';

export class ApplicationsService extends HttpService {
  constructor(options?: HttpServiceOptions) {
    super(options);
  }

  /** A page of sent applications, counts per status and today's quota. */
  async getApplications(query: ApplicationsQuery = {}) {
    const { data } = await this.get<ApplicationsPage>('/applications', {
      params: query,
    });
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

  /** Moves an application to another status, or saves its notes. */
  async updateApplication(id: string, payload: UpdateApplicationPayload) {
    const { data } = await this.patch<
      UpdateApplicationPayload,
      SentApplication
    >(`/applications/${id}`, payload);
    return data;
  }

  /** Takes it off the list (it still counts toward today's limit). */
  async deleteApplication(id: string) {
    await this.delete(`/applications/${id}`);
  }
}
