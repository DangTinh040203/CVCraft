import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/libs/databases/prisma.service';
import { type Prisma } from '@/libs/databases/prisma/generated/client';
import { ApplicationStatus } from '@/libs/databases/prisma/generated/enums';
import {
  type CreateSentApplication,
  type ISentApplicationRepository,
  type SentApplicationQuery,
  type UpdateSentApplication,
} from '@/modules/applications/application/interfaces';
import { SentApplication } from '@/modules/applications/domain';

@Injectable()
export class PrismaSentApplicationRepository implements ISentApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSentApplication): Promise<SentApplication> {
    return new SentApplication(
      await this.prisma.sentApplication.create({ data }),
    );
  }

  countSince(userId: string, since: Date): Promise<number> {
    return this.prisma.sentApplication.count({
      where: { userId, createdAt: { gte: since } },
    });
  }

  async findPage(userId: string, query: SentApplicationQuery) {
    const search = query.search?.trim();
    const where: Prisma.SentApplicationWhereInput = {
      userId,
      deletedAt: null,
      status: query.status,
      OR: search
        ? (['jobTitle', 'company', 'toEmail', 'subject'] as const).map(
            (field) => ({
              [field]: { contains: search, mode: 'insensitive' as const },
            }),
          )
        : undefined,
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.sentApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.sentApplication.count({ where }),
    ]);
    return { items: rows.map((row) => new SentApplication(row)), total };
  }

  async countByStatus(userId: string) {
    const groups = await this.prisma.sentApplication.groupBy({
      by: ['status'],
      where: { userId, deletedAt: null },
      _count: { _all: true },
    });
    const counts = Object.fromEntries(
      Object.values(ApplicationStatus).map((status) => [status, 0]),
    ) as Record<ApplicationStatus, number>;
    for (const group of groups) counts[group.status] = group._count._all;
    return counts;
  }

  async update(userId: string, id: string, data: UpdateSentApplication) {
    // Scoped to the owner, so another user's id simply matches nothing
    const { count } = await this.prisma.sentApplication.updateMany({
      where: { id, userId, deletedAt: null },
      data,
    });
    if (!count) return null;
    const row = await this.prisma.sentApplication.findUnique({ where: { id } });
    return row && new SentApplication(row);
  }

  async remove(userId: string, id: string) {
    const { count } = await this.prisma.sentApplication.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return count > 0;
  }
}
