/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('active', 'deleted', 'archived');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "EventDetail" (
    "id" TEXT NOT NULL,
    "startAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "country" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "address" TEXT,
    "venue" TEXT,
    "websiteUrl" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "ticketsUrl" TEXT,

    CONSTRAINT "EventDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- AddForeignKey
ALTER TABLE "EventDetail" ADD CONSTRAINT "EventDetail_id_fkey" FOREIGN KEY ("id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
