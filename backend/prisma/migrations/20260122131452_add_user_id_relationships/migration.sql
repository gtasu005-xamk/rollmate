/*
  Warnings:

  - Added the required column `userId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `TrainingSession` table without a default value. This is not possible if the table is not empty.

*/
-- Get or create a default user for existing records
INSERT INTO "User" (id, email, password) 
VALUES ('migration-default-user', 'migration@default.local', 'hashed')
ON CONFLICT ("email") DO NOTHING;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "TrainingSession" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT;

-- Update existing records with default user
UPDATE "Task" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;
UPDATE "Theme" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;
UPDATE "TrainingSession" SET "userId" = 'migration-default-user' WHERE "userId" IS NULL;

-- Make userId NOT NULL
ALTER TABLE "Task" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Theme" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "TrainingSession" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "Theme_userId_idx" ON "Theme"("userId");

-- CreateIndex
CREATE INDEX "TrainingSession_userId_idx" ON "TrainingSession"("userId");

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
