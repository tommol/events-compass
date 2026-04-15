-- CreateTable
CREATE TABLE "EventToken" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventToken_userId_idx" ON "EventToken"("userId");

-- CreateIndex
CREATE INDEX "EventToken_eventId_idx" ON "EventToken"("eventId");

-- AddForeignKey
ALTER TABLE "EventToken" ADD CONSTRAINT "EventToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventToken" ADD CONSTRAINT "EventToken_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
