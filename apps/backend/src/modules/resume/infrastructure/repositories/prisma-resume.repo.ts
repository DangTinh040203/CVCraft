import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/libs/databases/prisma.service';
import { Prisma } from '@/libs/databases/prisma/generated/client';
import {
  type CreateResumeCommand,
  type UpdateResumeCommand,
} from '@/modules/resume/application/commands';
import { type IResumeRepository } from '@/modules/resume/application/interfaces';
import { Resume } from '@/modules/resume/domain';

const byOrder = { orderBy: { order: 'asc' } } as const;

const resumeInclude = {
  information: byOrder,
  educations: byOrder,
  workExperiences: byOrder,
  projects: byOrder,
  skills: byOrder,
  certifications: byOrder,
  languages: byOrder,
} as const;

const DATE_FIELDS = ['startDate', 'endDate', 'date'] as const;

/**
 * Prisma only takes full ISO date-times as strings, so pass dates as Date
 * objects; that way date-only values like "2024-01-31" are accepted too.
 */
const withDates = <T extends object>(item: T): T => {
  const out = { ...item } as Record<string, unknown>;
  for (const key of DATE_FIELDS) {
    if (typeof out[key] === 'string') out[key] = new Date(out[key]);
  }
  return out as T;
};

/** Persist array position as `order` so the client's ordering survives a round trip. */
const withOrder = <T extends object>(items: T[] | undefined) =>
  (items ?? []).map((item, order) => ({ ...withDates(item), order }));

/** undefined keeps the stored format; null clears it back to the defaults. */
const toJson = (
  format: CreateResumeCommand['format'],
): Prisma.InputJsonValue | typeof Prisma.DbNull | undefined => {
  if (format === undefined) return undefined;
  if (format === null) return Prisma.DbNull;
  return format as Prisma.InputJsonValue;
};

@Injectable()
export class PrismaAdapterResumeRepository implements IResumeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Resume | null> {
    const resume = await this.prisma.resume.findUnique({
      where: { userId },
      include: resumeInclude,
    });
    return resume ? new Resume(resume) : null;
  }

  async create(userId: string, payload: CreateResumeCommand): Promise<Resume> {
    const resume = await this.prisma.resume.create({
      data: {
        userId,
        title: payload.title,
        subTitle: payload.subTitle,
        overview: payload.overview,
        avatar: payload.avatar,
        templateKey: payload.templateKey ?? null,
        format: toJson(payload.format),
        information: { create: withOrder(payload.information) },
        educations: { create: withOrder(payload.educations) },
        workExperiences: { create: withOrder(payload.workExperiences) },
        projects: { create: withOrder(payload.projects) },
        skills: { create: withOrder(payload.skills) },
        certifications: { create: withOrder(payload.certifications) },
        languages: { create: withOrder(payload.languages) },
      },
      include: resumeInclude,
    });
    return new Resume(resume);
  }

  async findById(id: string): Promise<Resume | null> {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      include: resumeInclude,
    });
    return resume ? new Resume(resume) : null;
  }

  /**
   * Checks if a resume exists and returns only the userId for authorization.
   * Avoids loading all relations just to verify ownership.
   */
  async findOwner(id: string): Promise<{ id: string; userId: string } | null> {
    return this.prisma.resume.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
  }

  async update(id: string, payload: UpdateResumeCommand): Promise<Resume> {
    const withResume = <T extends object>(items: T[] | undefined) =>
      withOrder(items).map((item) => ({ ...item, resumeId: id }));

    await this.prisma.$transaction(async (tx) => {
      // Step 1: Delete all existing related data
      await Promise.all([
        tx.resumeInformation.deleteMany({ where: { resumeId: id } }),
        tx.education.deleteMany({ where: { resumeId: id } }),
        tx.workExperience.deleteMany({ where: { resumeId: id } }),
        tx.project.deleteMany({ where: { resumeId: id } }),
        tx.skill.deleteMany({ where: { resumeId: id } }),
        tx.certification.deleteMany({ where: { resumeId: id } }),
        tx.language.deleteMany({ where: { resumeId: id } }),
      ]);

      // Step 2: Update resume metadata
      await tx.resume.update({
        where: { id },
        data: {
          title: payload.title,
          subTitle: payload.subTitle,
          overview: payload.overview,
          avatar: payload.avatar,
          templateKey: payload.templateKey,
          format: toJson(payload.format),
        },
      });

      // Step 3: Re-create related data, keeping the client's order
      await Promise.all([
        tx.resumeInformation.createMany({
          data: withResume(payload.information),
        }),
        tx.education.createMany({ data: withResume(payload.educations) }),
        tx.workExperience.createMany({
          data: withResume(payload.workExperiences),
        }),
        tx.project.createMany({ data: withResume(payload.projects) }),
        tx.skill.createMany({ data: withResume(payload.skills) }),
        tx.certification.createMany({
          data: withResume(payload.certifications),
        }),
        tx.language.createMany({ data: withResume(payload.languages) }),
      ]);
    });

    // Fetch the updated resume with all relations
    const resume = await this.prisma.resume.findUniqueOrThrow({
      where: { id },
      include: resumeInclude,
    });
    return new Resume(resume);
  }
}
