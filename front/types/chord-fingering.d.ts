declare module 'chord-fingering' {
  export interface ChordFingering {
    positionString: string;
    difficulty: number;
    barre?: {
      fret: number;
      stringIndices: number[];
    };
    positions: any[];
  }

  export interface ChordResult {
    input: string;
    symbol: string;
    notes: string[];
    description: string;
    fingerings: ChordFingering[];
  }

  export function findGuitarChord(chordName: string): ChordResult;
}
