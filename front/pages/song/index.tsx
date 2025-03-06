import { useState } from 'react';
import styles from '../../styles/create-song.module.css';
import Link from 'next/link';
import songService from '../../service/app.service';

function App() {
  const [artist, setArtist] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [lyrics, setLyrics] = useState<string>("");

  const handleClick = async() => {
    const lyricArray = lyrics.split("\n");
    const song = {
      artist: artist,
      name: name,
      lyrics: lyricArray.map((lyric, i) => ({
        lineIndex: i,
        text: lyric,
        chords: [],
      })),
    };
    try {
      await songService.createSong(song);       
      alert('Letra criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar Letra:', error);
      alert('Erro ao criar Letra');
    }
  };

  return (
    <div className={styles['table-container']}>
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>Nova Música</h2>
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
            Adicionar Letra
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;