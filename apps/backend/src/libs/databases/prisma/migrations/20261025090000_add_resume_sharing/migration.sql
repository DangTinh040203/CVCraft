-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Resume_shareSlug_key" ON "Resume"("shareSlug");
