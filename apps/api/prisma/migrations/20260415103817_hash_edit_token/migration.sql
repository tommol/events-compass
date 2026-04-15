/*
  Warnings:

  - You are about to drop the column `token` on the `EventToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `EventToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `EventToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EventToken_token_key";

-- AlterTable
ALTER TABLE "EventToken" DROP COLUMN "token",
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EventToken_tokenHash_key" ON "EventToken"("tokenHash");
