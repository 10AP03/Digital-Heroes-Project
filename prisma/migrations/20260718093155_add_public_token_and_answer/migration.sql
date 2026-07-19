/*
  Warnings:
  - A unique constraint covering the columns `[publicToken]` on the table `Interview` will be added. If there are existing duplicate values, this will fail.
  - The required column `publicToken` was added to the `Interview` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
*/
-- AlterTable: add publicToken as nullable first
ALTER TABLE "Interview" ADD COLUMN     "publicToken" TEXT;

-- Backfill existing rows with a random unique token
UPDATE "Interview" SET "publicToken" = gen_random_uuid()::text WHERE "publicToken" IS NULL;

-- Now make it required
ALTER TABLE "Interview" ALTER COLUMN "publicToken" SET NOT NULL;

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "inputMethod" TEXT NOT NULL DEFAULT 'typed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "Answer_interviewId_questionId_key" ON "Answer"("interviewId", "questionId");
-- CreateIndex
CREATE UNIQUE INDEX "Interview_publicToken_key" ON "Interview"("publicToken");
-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;