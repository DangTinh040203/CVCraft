import {
  type CreateResumeCommand,
  type UpdateResumeCommand,
} from '@/modules/resume/application/commands';
import { type Resume } from '@/modules/resume/domain';

export interface ResumeOwner {
  id: string;
  userId: string;
  shareSlug: string | null;
}

export interface ResumeSharing {
  isPublic: boolean;
  shareSlug: string | null;
}

export const RESUME_REPOSITORY_TOKEN = Symbol('RESUME_REPOSITORY_TOKEN');

export interface IResumeRepository {
  create(userId: string, payload: CreateResumeCommand): Promise<Resume>;
  findById(id: string): Promise<Resume | null>;
  findOwner(id: string): Promise<ResumeOwner | null>;
  findByUserId(userId: string): Promise<Resume | null>;
  /** A resume shared publicly under this slug; null when not shared. */
  findPublicBySlug(slug: string): Promise<Resume | null>;
  update(id: string, payload: UpdateResumeCommand): Promise<Resume>;
  updateSharing(id: string, sharing: ResumeSharing): Promise<ResumeSharing>;
}
