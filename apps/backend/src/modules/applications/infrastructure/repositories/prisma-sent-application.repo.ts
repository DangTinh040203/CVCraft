import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/libs/databases/prisma.service';
import {
  type CreateSentApplication,
  type ISentApplicationRepository,
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

  async findRecent(userId: string, limit: number): Promise<SentApplication[]> {
    const rows = await this.prisma.sentApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((row) => new SentApplication(row));
  }
}
