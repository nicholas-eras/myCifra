export interface Chord {
  id?: number;
  chord: string;
  position: number;
  offset: number;
  lineIndex: number;
  lyricId: number;
  width: string;
}

interface LyricLine {
  id?: number;
  lineIndex: number;
  text: string;
  songId?: number;
  chords: Chord[];
}

export class CreateSongDto {
  name: string;
  artist: string;
  lyrics?: Omit<LyricLine, "songId">[];
}

export class UpdateSongDto {
  id: number;
  name?: string;
  artist?: string;
  lyrics?: LyricLine[];
}
