-- DropForeignKey
ALTER TABLE "Song" DROP CONSTRAINT "Song_createdBy_fkey";

-- AlterTable
ALTER TABLE "Song" ALTER COLUMN "createdBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
