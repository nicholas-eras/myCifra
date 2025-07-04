import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface Chord {
  id: number;
  lyricId: number;
  chord: string;
  position: number;
  offset: number;
  width: string;
  lineIndex: number;
}

interface Line {
  id: number;
  lineIndex: number;
  text: string;
  chords: Chord[];
}

@Injectable()
export class CifraService {
  extractArtistSong(url: string) {
    const regex = /cifraclub\.com\.br\/([^\/]+)\/([^\/]+)\/?/;
    const match = url.match(regex);

    if (!match) return null;

    const artista = decodeURIComponent(match[1]);
    const musica = decodeURIComponent(match[2]);

    return { artista, musica };
  }


  processCifra(cifra: string[]): Line[] {
    const result: Line[] = [];
    let lineIndex = 0;
    let i = 0;
    let idCounter = 1;

  while (i < cifra.length) {
    let line = cifra[i];

    console.log(`\n====================`);
    console.log(`Linha ${i}: "${cifra[i]}"`);

    let headerMatch = line.match(/^\[(.*?)\]/);
    if (headerMatch) {
      const afterHeader = line.slice(headerMatch[0].length).trim();
      if (afterHeader === "") {
        console.log(`Linha ${i} era só cabeçalho: "${headerMatch[0]}" -> Ignorada`);
        i++;
        continue;
      } else {
        console.log(`Linha ${i} tinha cabeçalho: "${headerMatch[0]}" -> Conteúdo restante: "${afterHeader}"`);
        line = afterHeader;
      }
    }

    console.log(`Linha ${i} após tratar cabeçalho: "${line}"`);

    if (
      line.trim() === "" ||
      /^[EADGBe]\|/.test(line.trim())
    ) {
      console.log(`Linha ${i} ignorada por ser vazia ou tablatura`);
      i++;
      continue;
    }

    const tokens = line.trim().split(/\s+/);
    let tokensToTest = tokens;

    // Se linha inteira entre parênteses, remove-os antes de splitar
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("(") && trimmedLine.endsWith(")")) {
      const insideParens = trimmedLine.slice(1, -1).trim();
      tokensToTest = insideParens.split(/\s+/);
    }

    const isChordLine = tokensToTest.length > 0 && tokensToTest.every(token =>
      /^[A-G](#|b)?[a-zA-Z0-9/()#b+]*$/.test(token)
    );


    console.log(`Linha ${i}: tokens = ${JSON.stringify(tokens)}, isChordLine=${isChordLine}`);

    if (isChordLine) {
      const chordLine = line;
      let lyricLine = "";

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
          lyricLine = next;
          console.log(`Linha ${i}: Acordes + letra -> "${lyricLine}"`);
          i += 2;
        } else {
          lyricLine = "";
          console.log(`Linha ${i}: Só acordes, sem letra`);
          i++;
        }
      } else {
        lyricLine = "";
        console.log(`Linha ${i}: Última linha de acordes, sem letra`);
        i++;
      }

      const chordsParsed = this.parseChords(chordLine, lyricLine !== "" ? lyricLine : " ", idCounter);
      console.log(`Linha ${i}: parseChords() retornou ${chordsParsed.length} acordes`);

      result.push({
        id: idCounter++,
        lineIndex: lineIndex++,
        text: lyricLine,
        chords: chordsParsed,
      });

    } else {
      console.log(`Linha ${i}: Só letra`);
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

    // Se não tem letra, usamos offsets absolutos
    const isEmptyLyric = lyricLine.trim() === "";

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
      const width = Math.max(chord.text.length, 3);

      if (isEmptyLyric) {
        // Caso sem letra: offset absoluto
        const offset = chord.start / Math.max(chordLine.length, 1) * 100;
        chordObjs.push({
          id: startId + idx,
          lyricId: startId,
          chord: chord.text,
          position: -1,
          offset,
          width: `${width}ch`,
          lineIndex: 0,
        });
      } else {
        // Caso com letra vinculada
        const chordColumn = chord.start;
        let position = words.length - 1;

        for (let w = 0; w < words.length; w++) {
          if (chordColumn < words[w].start) {
            position = w;
            break;
          }
          if (chordColumn >= words[w].start && chordColumn <= words[w].end) {
            position = w;
            break;
          }
        }


        let offset = 0;
        if (position < words.length) {
          const word = words[position];
          offset = (chordColumn - word.start) / Math.max(word.word.length, 1);
        }

        chordObjs.push({
          id: startId + idx,
          lyricId: startId,
          chord: chord.text,
          position,
          offset,
          width: `${width}ch`,
          lineIndex: 0,
        });
      }
    });

    return chordObjs;
  }

  async redirectScrapeCifra(url: string): Promise<any> {
    const parsed = this.extractArtistSong(url);
    if (!parsed) return { error: 'Invalid URL' };

    const { artista, musica } = parsed;
    const internalServiceBaseUrl = process.env.CIFRA_SCRAPER_BASE_URL;
    const fullUrl = `${internalServiceBaseUrl}/artists/${artista}/songs/${musica}`;
    console.log(fullUrl);
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
