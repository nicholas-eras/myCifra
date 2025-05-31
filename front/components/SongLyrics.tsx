import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/create-song.module.css';
import Link from 'next/link';
import songService from '../service/app.service';

interface SongFormProps {
  songId?: string;
}
interface LyricLine {
  id: number;
  lineIndex: number;
  text: string;
  chords?: string[];
}

function SongForm({ songId }: SongFormProps) {
  const router = useRouter();
  const [artist, setArtist] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [oldSong, setSong] = useState();

  useEffect(() => {
    if (songId) {
      (async () => {
        try {
          const song = await songService.getSongById(+songId);
          setSong(song);
          setArtist(song.artist);
          setName(song.name);
          setLyrics(song.lyrics);
        } catch (error) {
          console.error('Erro ao buscar música:', error);
          alert('Erro ao carregar a música.');
        }
      })();
    }
  }, [songId]);

  const handleClick = async () => {
    const song = {
      artist,
      name,
      lyrics: lyrics.map((lyric, i) => {
        return {
          id: lyric.id ?? i,
          lineIndex: lyric.lineIndex ?? i,
          text: lyric.text,
          chords: lyric.chords ?? [],
        };
      })

    };

    try {
      if (songId) {
        await songService.updateSong(+songId, song);
        alert('Letra atualizada com sucesso!');
      } else {
        await songService.createSong(song);
        alert('Letra criada com sucesso!');
      }
      // router.push('/');
    } catch (error) {
      console.error('Erro ao salvar Letra:', error);
      alert('Erro ao salvar Letra');
    }
  };

  return (
    <div className={styles['table-container']}>
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>{songId ? 'Editar Música' : 'Nova Música'}</h2>
        <Link href={`/`} className={styles.link}>
          Voltar
        </Link>
      </div>
      <div className={styles.campos}>
        <div className={styles.campo}>
          <label htmlFor="artist">Artista:</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>
        <div className={styles.campo}>
          <label htmlFor="name">Nome da Música:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.lyric}>
        <span className={styles.lyricSpan}>Letra</span>
        <textarea
          className={styles.textArea}
          id="textArea"
          value={lyrics.map(lyric => lyric.text).join("\n")}
          onChange={(e) => {
            const newLines = e.target.value.split('\n');

            setLyrics((prevLyrics) => {
              const usedIndexes = new Set<number>();

              return newLines.map((line, i) => {
                // Tenta encontrar uma linha com mesmo texto, ainda não usada
                const matched = prevLyrics.find((l, idx) => l.text === line && !usedIndexes.has(idx));
                
                if (matched) {
                  usedIndexes.add(prevLyrics.indexOf(matched));
                  return {
                    ...matched,
                    lineIndex: i,
                  };
                }

                // Se não achou, cria nova
                return {
                  id: Date.now() + i, // evita colisão de id
                  lineIndex: i,
                  text: line,
                  chords: [],
                };
              });
            });
          }}
        />
        <div className={styles.headingRow}>
          <button className={styles.heading} onClick={handleClick}>
            {songId ? 'Atualizar Letra' : 'Adicionar Letra'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SongForm;
