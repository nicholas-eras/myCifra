import styles from '../../styles/create-music.module.css';
import Link from 'next/link';

function App() {
  return (
    <div className={styles['table-container']}>
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>Nova Música</h2>
        <Link href={`/`} className={styles.link}>
          Voltar
        </Link>
      </div>
      <div className={styles.lyric}>
        <textarea className={styles.textArea}/>                
      </div>
    </div>
  );
}

export default App;