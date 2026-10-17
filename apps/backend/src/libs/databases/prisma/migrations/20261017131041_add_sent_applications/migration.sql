-- CreateTable
CREATE TABLE "sent_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "jobTitle" TEXT,
    "company" TEXT,
    "providerMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sent_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sent_applications_userId_createdAt_idx" ON "sent_applications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "sent_applications" ADD CONSTRAINT "sent_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
