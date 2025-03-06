-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "artist" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lyric" (
    "id" SERIAL NOT NULL,
    "lineIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "songId" INTEGER NOT NULL,

    CONSTRAINT "Lyric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chord" (
    "id" SERIAL NOT NULL,
    "lyricId" INTEGER NOT NULL,
    "chord" TEXT NOT NULL,
    "width" TEXT NOT NULL,
    "marginLeft" TEXT NOT NULL,

    CONSTRAINT "Chord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lyric" ADD CONSTRAINT "Lyric_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chord" ADD CONSTRAINT "Chord_lyricId_fkey" FOREIGN KEY ("lyricId") REFERENCES "Lyric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
