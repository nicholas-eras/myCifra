import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface Chord {
  id: number;
  lyricId: number;
  chord: string;
  position: number;
  offset: number;
  width: string;
}

interface Line {
  id: number;
  lineIndex: number;
  text: string;
  chords: Chord[];
}

@Injectable()
export class CifraService {
  private extractArtistSong(url: string) {
    const regex = /cifraclub\.com\.br\/([^\/]+)\/([^\/]+)\/?/;
    const match = url.match(regex);

    if (!match) return null;

    const artista = decodeURIComponent(match[1]);
    const musica = decodeURIComponent(match[2]);

    return { artista, musica };
  }


  private processCifra(cifra: string[]): Line[] {
    const result: Line[] = [];
    let lineIndex = 0;
    let i = 0;
    let idCounter = 1;

    while (i < cifra.length) {
      const line = cifra[i].trim();

      // Ignorar linhas vazias, tablaturas e cabeçalhos
      if (
        line === "" ||
        line.startsWith("[") ||
        /^[EADGBe]\|/.test(line)
      ) {
        i++;
        continue;
      }

      // Detectar linha de acordes
      const tokens = line.trim().split(/\s+/);
      const isChordLine = tokens.length > 0 && tokens.every(token =>
        /^[A-G](#|b)?[a-zA-Z0-9/()#b+]*$/.test(token)
      );

      if (isChordLine) {
        const chordLine = line;
        let lyricLine = "";

        // Checar apenas a próxima linha
        if (i + 1 < cifra.length) {
          const nextRaw = cifra[i + 1];
          const next = nextRaw.trim();

          const nextTokens = next.split(/\s+/);
          const nextIsChordLine = nextTokens.length > 0 && nextTokens.every(token =>
            /^[A-G](#|b)?[a-zA-Z0-9/()#b+]*$/.test(token)
          );

          if (
            next !== "" &&
            !next.startsWith("[") &&
            !/^[EADGBe]\|/.test(next) &&
            !nextIsChordLine
          ) {
            // É uma linha de letra vinculada
            lyricLine = next;
            i += 2; // Avança duas linhas
          } else {
            // Linha de acordes sem letra
            lyricLine = "";
            i++;
          }
        } else {
          // Última linha
          lyricLine = "";
          i++;
        }

        if (lyricLine !== "") {
          const chordsParsed = this.parseChords(chordLine, lyricLine, idCounter);
          result.push({
            id: idCounter++,
            lineIndex: lineIndex++,
            text: lyricLine,
            chords: chordsParsed,
          });
        } else {
          const chordsParsed = this.parseChords(chordLine, " ", idCounter);
          result.push({
            id: idCounter++,
            lineIndex: lineIndex++,
            text: "",
            chords: chordsParsed,
          });
        }
      } else {
        // Linha só de letra
        result.push({
          id: idCounter++,
          lineIndex: lineIndex++,
          text: line,
          chords: [],
        });
        i++;
      }
    }

    return result;
  }

  private parseChords(chordLine: string, lyricLine: string, startId: number): Chord[] {
    const chords: { text: string; start: number }[] = [];
    let i = 0;

    // Extrair acordes com índice de coluna
    while (i < chordLine.length) {
      if (chordLine[i] !== " ") {
        const start = i;
        while (i < chordLine.length && chordLine[i] !== " ") i++;
        const text = chordLine.substring(start, i);
        chords.push({ text, start });
      } else {
        i++;
      }
    }

    // Regex para capturar palavras com índice
    const wordRegex = /\S+/g;
    const words: { word: string; start: number; end: number }[] = [];
    let match: RegExpExecArray | null;
    while ((match = wordRegex.exec(lyricLine)) !== null) {
      words.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    const chordObjs: Chord[] = [];

    chords.forEach((chord, idx) => {
      const chordColumn = chord.start;
      let position = 0;

      for (let w = 0; w < words.length; w++) {
        if (chordColumn >= words[w].start && chordColumn <= words[w].end) {
          position = w;
          break;
        }
        if (chordColumn < words[w].start) {
          position = w;
          break;
        }
        position = w;
      }

      let offset = 0;
      if (position < words.length) {
        const word = words[position];
        offset = (chordColumn - word.start) / Math.max(word.word.length, 1);
      }

      const width = Math.max(chord.text.length, 3);

      chordObjs.push({
        id: startId + idx,
        lyricId: startId,
        chord: chord.text,
        position,
        offset,
        width: `${width}ch`,
      });
    });

    return chordObjs;
  }

  private diferentiateLyricChords(text: string[]){
    const chordObjs: Chord[] = [];
    text.forEach((row: string, i: number) => {
      if (row.startsWith('E|') || row.startsWith("B|") || row.startsWith("G|") || row.startsWith("D|") || row.startsWith("A|")){
        return;
      }
      const words = row.split(" ");
      const regex = /[a-ln-z]/; // regex: letras de a a l + n a z (exclui 'm')

      words.forEach((word: string) => {
        if (regex.test(word)){          
          row = row.replaceAll(word, "");
        }
      });      

      chordObjs.push({
          id: i,
          lyricId: i,
          chord: row,
          position: 0,
          offset: 0,
          width: `${row.length}ch`,
        });
    });
 
    return chordObjs;
  }

  async redirectScrapeCifra(url: string): Promise<any> {
    const parsed = this.extractArtistSong(url);
    if (!parsed) return { error: 'Invalid URL' };

    const { artista, musica } = parsed;
    const internalServiceBaseUrl = process.env.CIFRA_SCRAPER_BASE_URL;
    const fullUrl = `${internalServiceBaseUrl}/artists/${artista}/songs/${musica}`;

    try {
      const cifraclubStringResponse = await axios.get(fullUrl);
      const cifraclubString = cifraclubStringResponse.data;

      return {
        name: cifraclubString.name,
        artist: cifraclubString.artist,
        lyrics: this.processCifra(cifraclubString.cifra)
      };
    } catch (error) {
      console.error(error);
      return {
        error: 'Erro ao buscar cifra',
        details: (error as Error).message,
      };
    }
  }
}
