import { useEffect, useState } from 'react';
import styles from '../styles/index.module.css';
import musicService from '../service/app.service';
import Link from 'next/link';

function App() {
  const [musicList, setMusicList] = useState<any[]>([]);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const data = await musicService.getAllMusic();
        setMusicList(data);
      } catch (error) {
        console.error('Failed to fetch music data:', error);
      }
    };

    fetchMusic();
  }, []);

  return (
    <div className={styles['table-container']}>
      <h2 className={styles.heading}>Lista de Músicas</h2>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th}>Artista</th>
            <th className={styles.th}>Nome</th>
          </tr>
        </thead>
        <tbody className={styles.tb}>
          {musicList.length > 0 ? (
            musicList.map((music) => (
              <tr key={music.id} className={styles.tr}>
                <td className={styles.td}>
                  <Link href={`/${music.id}`} className={styles.link}>
                    {music.artist}
                  </Link>
                </td>
                <td className={styles.td}>
                  <Link href={`/${music.id}`} className={styles.link}>
                    {music.name}
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr className={styles.tr}>
              <td colSpan={2} className={styles.td}>Carregando...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;