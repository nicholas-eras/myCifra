interface lyricsInterface {
  lineIndex: number;
  text: string;
  chords: {
    id?: number;
    chord: string;
    width: string;
    marginLeft: string;
    lineIndex: number;
  }[];
};

export class UpdateMusicDto {
  name: string;
  artist: string;
  lyrics: lyricsInterface[];
}

export class CreateMusicDto {
  name: string;
  artist: string;
  lyrics?: lyricsInterface[];
}
