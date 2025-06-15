-- CreateTable
CREATE TABLE "SongText" (
    "id" SERIAL NOT NULL,
    "songId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lyrics" JSONB NOT NULL,

    CONSTRAINT "SongText_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SongText" ADD CONSTRAINT "SongText_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
