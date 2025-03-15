import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/create-song.module.css';
import Link from 'next/link';
import songService from '../service/app.service';

interface SongFormProps {
  songId?: string;
}

function SongForm({ songId }: SongFormProps) {
  const router = useRouter();
  const [artist, setArtist] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [lyrics, setLyrics] = useState<string>('');

  useEffect(() => {
    if (songId) {
      (async () => {
        try {
          const song = await songService.getSongById(+songId);
          setArtist(song.artist);
          setName(song.name);
          setLyrics(song.lyrics.map((line: any) => line.text).join('\n'));
        } catch (error) {
          console.error('Erro ao buscar música:', error);
          alert('Erro ao carregar a música.');
        }
      })();
    }
  }, [songId]);

  const handleClick = async () => {
    const lyricArray = lyrics.split('\n');
    const song = {
      artist,
      name,
      lyrics: lyricArray.map((lyric, i) => ({
        lineIndex: i,
        text: lyric,
        chords: [],
      })),
    };

    try {
      if (songId) {
        await songService.updateSong(+songId, song);
        alert('Letra atualizada com sucesso!');
      } else {
        await songService.createSong(song);
        alert('Letra criada com sucesso!');
      }
      router.push('/');
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
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
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
