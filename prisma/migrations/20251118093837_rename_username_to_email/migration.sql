/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/

-- Rename username → email (safe for non-empty table)

-- 1. Add the new column (allow null for now)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;

-- 2. Copy existing data (preserves every dot!)
UPDATE "User" SET "email" = "username" WHERE "email" IS NULL;

-- 3. Make it required + unique
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- 4. Clean up the old column and its index
DROP INDEX IF EXISTS "User_username_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "username";
