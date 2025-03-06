/*
  Warnings:

  - A unique constraint covering the columns `[songId,lineIndex]` on the table `Lyric` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Lyric_songId_lineIndex_key" ON "Lyric"("songId", "lineIndex");
