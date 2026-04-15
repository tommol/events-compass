/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `EventToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `EventToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventToken" ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EventToken_token_key" ON "EventToken"("token");
