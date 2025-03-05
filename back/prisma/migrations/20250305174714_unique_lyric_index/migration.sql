/*
  Warnings:

  - A unique constraint covering the columns `[musicId,lineIndex]` on the table `Lyric` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Lyric_musicId_lineIndex_key" ON "Lyric"("musicId", "lineIndex");
