-- AlterTable
ALTER TABLE "CustomerNote" ADD COLUMN "therapistId" TEXT;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
