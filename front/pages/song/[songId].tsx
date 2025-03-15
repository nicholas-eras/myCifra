import { useRouter } from 'next/router';
import SongForm from '../../components/SongLyrics';

export default function EditSong() {
  const router = useRouter();
  const { songId } = router.query;

  if (!songId || typeof songId !== 'string') return <p>Carregando...</p>;

  return <SongForm songId={songId} />;
}
