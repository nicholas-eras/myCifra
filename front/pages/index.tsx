import { useEffect, useState } from "react";
import styles from "../styles/index.module.css";
import songService from "../service/app.service";
import usersService from "../service/users.service";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import { FaPen } from "react-icons/fa";
import { useRouter } from "next/router";

function App() {
  const [songList, setSongList] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canSyncCifra, setCanSyncCifra] = useState(false);
  const router = useRouter();

  // Playlist salva apenas IDs
  const [playlist, setPlaylist] = useState<number[]>([]);

  const handleGoogleLogin = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_ENVIRONMENT_BACKEND ?? "http://localhost:3000";
      const res = await fetch(`${backendUrl}/api/auth/google`);
      if (!res.ok) console.log(`Erro HTTP: ${res.status}`);
      const data = await res.json();
      if (!data?.url) console.log('Resposta inválida do servidor');
      window.location.href = data.url;
    } catch (err) {
      const frontendUrl = process.env.NEXT_PUBLIC_ENVIRONMENT_FRONTEND ?? "http://localhost:3001";
      console.error('Erro ao iniciar login com Google:', err);
      window.location.href = frontendUrl;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const songsData: any = await songService.getAllSong();
        setSongList(songsData.songs);
      } catch (error) {
        console.error('Erro ao carregar músicas:', error);
      }

      try {
        const userData = await usersService.getMe();
        setIsAdmin(userData.isAdmin);
        setCanSyncCifra(userData.canSyncCifra);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setIsAdmin(false);
        setCanSyncCifra(false);
      }
    };

    fetchData();
  }, []);

  // Lida com seleção/deseleção do checkbox
  const handleSelectSong = (id: number) => {
    setPlaylist((prev) => {
      if (prev.includes(id)) {
        // Remove da playlist
        return prev.filter((songId) => songId !== id);
      } else {
        // Adiciona ao final
        return [...prev, id];
      }
    });
  };

  const handleStartPlaylist = () => {
  if (playlist.length === 0) {
      alert("Selecione pelo menos uma música.");
      return;
    }
    const queryString = playlist.join(",");
    router.push(`/playlist?ids=${queryString}`);
  };

  return (
    <div className={styles["table-container"]}>
      <div className={styles.headingRow}>
        <div style={{ flex: 1 }}>
          <ThemeToggle />
        </div>
        <h2 className={styles.heading}>Lista de Músicas</h2>
        <div style={{ display: "flex", gap: "1rem", flex: 1, justifyContent: "flex-end" }}>
          <Link href={`/song`} className={styles.linkHeading}>
            Criar música
          </Link>
          {isAdmin && (
            <Link href={`/admin/users`} className={styles.linkHeading}>
              Gerenciar Usuários
            </Link>
          )}
          {canSyncCifra && (
            <Link href={`/sync-cifra`} className={styles.linkHeading}>
              Sincronizar CifraClub
            </Link>
          )}
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr className={styles.tr} style={{ width: "100%" }}>
            <th className={styles.th}></th>
            <th className={styles.th}>Artista</th>
            <th className={styles.th}>Nome</th>
            <th className={styles.th} style={{ width: "15%", textAlign: "center" }}>Editar Letra</th>
          </tr>
        </thead>
        <tbody className={styles.tb}>
          {songList.length > 0 ? (
            songList.map((song) => (
              <tr key={song.id} className={styles.tr}>
                <td className={styles.td}>
                  <input
                    type="checkbox"
                    checked={playlist.includes(song.id)}
                    onChange={() => handleSelectSong(song.id)}
                  />
                </td>
                <td className={styles.td}>
                  <Link href={`/${song.id}`} className={styles.link}>
                    {song.artist}
                  </Link>
                </td>
                <td className={styles.td}>
                  <Link href={`/${song.id}`} className={styles.link}>
                    {song.name}
                  </Link>
                </td>
                {song.createdByUser && (
                  <td style={{ textAlign: "center" }}>
                    <Link href={`/song/${song.id}`}>
                      <FaPen />
                    </Link>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr className={styles.tr} />
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "1rem" }}>
        <strong>Playlist:</strong>{" "}
        {playlist
          .map((id) => {
            const song = songList.find((s) => s.id === id);
            return song ? song.name : "";
          })
          .filter((name) => name)
          .join(", ")}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleStartPlaylist} className={styles.startButton}>
          Iniciar Playlist
        </button>
      </div>

      <button onClick={handleGoogleLogin} className={styles.googleButton}>
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className={styles.googleIcon}
        />
        Entrar com Google
      </button>
    </div>
  );
}

export default App;
