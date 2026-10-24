-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'ALL');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interviewType" "InterviewType" NOT NULL,
    "language" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "status" "InterviewStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "jobDescription" TEXT NOT NULL,
    "overallScore" INTEGER,
    "verdict" TEXT,
    "feedback" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_sessions_userId_startedAt_idx" ON "interview_sessions"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
