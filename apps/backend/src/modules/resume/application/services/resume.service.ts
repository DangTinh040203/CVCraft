import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';

import { CacheKeys, CacheService } from '@/libs/cache';
import { type UpdateResumeCommand } from '@/modules/resume/application/commands';
import {
  type IResumeRepository,
  RESUME_REPOSITORY_TOKEN,
  type ResumeOwner,
  type ResumeSharing,
} from '@/modules/resume/application/interfaces';
import { Resume } from '@/modules/resume/domain';

export type PublicResume = Omit<
  Resume,
  'id' | 'userId' | 'shareSlug' | 'isPublic' | 'createdAt'
>;

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    @Inject(RESUME_REPOSITORY_TOKEN)
    private readonly resumeRepository: IResumeRepository,
    private readonly cacheService: CacheService,
  ) {}

  async update(
    id: string,
    payload: UpdateResumeCommand,
    userId: string,
  ): Promise<Resume> {
    await this.authorizeOwner(id, userId);
    const resume = await this.resumeRepository.update(id, payload);
    await this.invalidateResumeCache(userId);
    return resume;
  }

  async findById(id: string, userId: string): Promise<Resume> {
    return this.findAndAuthorize(id, userId);
  }

  async findByUserId(userId: string): Promise<Resume | null> {
    const cacheKey = CacheKeys.resume.byUserId(userId);
    const cached = await this.cacheService.get<Resume | null>(cacheKey);

    if (cached !== undefined) {
      return cached ? new Resume(cached) : null;
    }

    this.logger.debug(`Cache MISS for resume by userId: ${userId}`);
    const resume = await this.resumeRepository.findByUserId(userId);

    if (resume) {
      await this.cacheService.set(cacheKey, resume);
    } else {
      await this.cacheService.set(cacheKey, null, 60 * 1000);
    }

    return resume;
  }

  /**
   * Turns the public link on or off. Off keeps the slug, so turning it back
   * on revives the same link; `regenerate` replaces it and the old link
   * stops working.
   */
  async updateSharing(
    id: string,
    userId: string,
    { enabled, regenerate }: { enabled: boolean; regenerate?: boolean },
  ): Promise<ResumeSharing> {
    const owner = await this.authorizeOwner(id, userId);
    const shareSlug =
      regenerate || (enabled && !owner.shareSlug)
        ? // 72 random bits: links can't be guessed or enumerated
          randomBytes(9).toString('base64url')
        : owner.shareSlug;
    const sharing = await this.resumeRepository.updateSharing(id, {
      isPublic: enabled,
      shareSlug,
    });
    await this.invalidateResumeCache(userId);
    return sharing;
  }

  /** A shared resume for anyone with the link, without account details. */
  async findPublic(slug: string): Promise<PublicResume> {
    const resume = await this.resumeRepository.findPublicBySlug(slug);
    if (!resume) {
      throw new NotFoundException(
        'This resume is not shared, or its link has changed',
      );
    }
    return {
      title: resume.title,
      subTitle: resume.subTitle,
      overview: resume.overview,
      avatar: resume.avatar,
      templateKey: resume.templateKey,
      format: resume.format,
      information: resume.information,
      educations: resume.educations,
      workExperiences: resume.workExperiences,
      projects: resume.projects,
      skills: resume.skills,
      certifications: resume.certifications,
      languages: resume.languages,
      updatedAt: resume.updatedAt,
    };
  }

  async invalidateResumeCache(userId: string): Promise<void> {
    await this.cacheService.del(CacheKeys.resume.byUserId(userId));
    this.logger.debug(`Cache invalidated for resume of user ${userId}`);
  }

  /**
   * Lightweight ownership check — only selects id + userId.
   * Use this when you don't need the full resume data (e.g., before update).
   */
  private async authorizeOwner(
    id: string,
    userId: string,
  ): Promise<ResumeOwner> {
    const owner = await this.resumeRepository.findOwner(id);
    if (!owner) {
      throw new NotFoundException(`Resume with id ${id} not found`);
    }
    if (owner.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this resume',
      );
    }
    return owner;
  }

  /**
   * Find a resume by ID and verify it belongs to the given user.
   * Throws NotFoundException if not found, ForbiddenException if not owned.
   */
  private async findAndAuthorize(id: string, userId: string): Promise<Resume> {
    const resume = await this.resumeRepository.findById(id);
    if (!resume) {
      throw new NotFoundException(`Resume with id ${id} not found`);
    }
    if (resume.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this resume',
      );
    }
    return resume;
  }
}
