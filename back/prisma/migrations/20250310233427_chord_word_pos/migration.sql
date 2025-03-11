/*
  Warnings:

  - You are about to drop the column `marginLeft` on the `Chord` table. All the data in the column will be lost.
  - Added the required column `offset` to the `Chord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Chord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chord" DROP COLUMN "marginLeft",
ADD COLUMN     "offset" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "position" INTEGER NOT NULL;
