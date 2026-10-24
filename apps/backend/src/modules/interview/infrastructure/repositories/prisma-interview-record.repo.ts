import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/libs/databases/prisma.service';
import { type Prisma } from '@/libs/databases/prisma/generated/client';
import {
  type CreateInterviewRecord,
  type FinishInterviewRecord,
  type IInterviewRecordRepository,
} from '@/modules/interview/application/interfaces';

@Injectable()
export class PrismaInterviewRecordRepository implements IInterviewRecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInterviewRecord): Promise<void> {
    await this.prisma.interviewSession.create({ data });
  }

  async finish(id: string, data: FinishInterviewRecord): Promise<void> {
    await this.prisma.interviewSession.update({
      where: { id },
      data: {
        status: data.status,
        questionsAnswered: data.questionsAnswered,
        endedAt: new Date(),
        overallScore: data.feedback?.overallScore,
        verdict: data.feedback?.verdict,
        feedback: data.feedback as unknown as Prisma.InputJsonValue | undefined,
      },
    });
  }

  countSince(userId: string, since: Date): Promise<number> {
    return this.prisma.interviewSession.count({
      where: { userId, startedAt: { gte: since } },
    });
  }
}
