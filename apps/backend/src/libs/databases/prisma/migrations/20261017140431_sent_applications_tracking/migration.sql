-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SENT', 'REPLIED', 'INTERVIEW', 'OFFER', 'REJECTED');

-- AlterTable
ALTER TABLE "sent_applications" ADD COLUMN     "body" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "replyTo" TEXT,
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'SENT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
