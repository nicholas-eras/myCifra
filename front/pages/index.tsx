import { useEffect, useState } from "react";
import styles from "../styles/index.module.css";
import songService from "../service/app.service";
import usersService from "../service/users.service";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import { FaPen } from "react-icons/fa";
import { useRouter } from "next/router";
import { saveSongOffline, getOfflineSongs, saveUserPermissionsAndSongs, getUserPermissionsAndSongs } from '../service/indexedDb';

function App() {
  const [songList, setSongList] = useState<any[]>([]);
  const [canAddSong, setCanAddSong] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canSyncCifra, setCanSyncCifra] = useState(false);
  const [sortBy, setSortBy] = useState<"artist" | "name" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [playlist, setPlaylist] = useState<number[]>([]);
  const router = useRouter();

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
      // 👇 se offline, pula direto pro IndexedDB
      if (!navigator.onLine) {
        console.warn("Sem internet, carregando dados offline...");
        const offlineData = await getUserPermissionsAndSongs();
        if (offlineData) {
          setSongList(offlineData.songs || []);
          setIsAdmin(offlineData.isAdmin || false);
          setCanAddSong(offlineData.canAddSong || false);
          setCanSyncCifra(offlineData.canSyncCifra || false);
        } else {
          console.error("Sem dados offline disponíveis.");
          setSongList([]);
          setIsAdmin(false);
          setCanAddSong(false);
          setCanSyncCifra(false);
        }
        return;
      }

      try {
        const [songsData, userData] = await Promise.all([
          songService.getAllSong(),
          usersService.getMe(),
        ]);

        setSongList(songsData!.songs);
        setCanAddSong(userData.canAddSong);
        setIsAdmin(userData.isAdmin);
        setCanSyncCifra(userData.canSyncCifra);

        await saveUserPermissionsAndSongs({
          songs: songsData!.songs,
          isAdmin: userData.isAdmin,
          canAddSong: userData.canAddSong,
          canSyncCifra: userData.canSyncCifra,
        });
      } catch (error) {
        console.warn("Erro inesperado:", error);
        // Se der erro mesmo online, ainda tenta offline
        const offlineData = await getUserPermissionsAndSongs();
        if (offlineData) {
          setSongList(offlineData.songs || []);
          setIsAdmin(offlineData.isAdmin || false);
          setCanAddSong(offlineData.canAddSong || false);
          setCanSyncCifra(offlineData.canSyncCifra || false);
        }
        else{
          setSongList([]);
          setIsAdmin(false);
          setCanAddSong(false);
          setCanSyncCifra(canSyncCifra || false);
        }
      }
    };

    fetchData();
  }, []);



  const toggleSort = (field: "artist" | "name") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSelectSong = (id: number) => {
    setPlaylist((prev) =>
      prev.includes(id) ? prev.filter((songId) => songId !== id) : [...prev, id]
    );
  };

  const handleStartPlaylist = () => {
    if (playlist.length === 0) {
      alert("Selecione pelo menos uma música.");
      return;
    }
    const queryString = playlist.join(",");
    router.push(`/playlist?ids=${queryString}`);
  };

  async function baixarMusica() {
    const song = await songService.getSongById(playlist[0]);
    await saveSongOffline(song);
    alert('Música salva para uso offline!');
  }

  // Combina filtro + ordenação
  const finalSongs = [...songList]
    .filter((song) =>
      song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortBy) return 0;
      const fieldA = a[sortBy].toLowerCase();
      const fieldB = b[sortBy].toLowerCase();
      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className={styles["table-container"]}>
      <div className={styles.headingRow}>
        <div style={{ flex: 1 }}>
          <ThemeToggle />
        </div>
        <h2 className={styles.heading}>Lista de Músicas</h2>
        <div style={{ display: "flex", gap: "1rem", flex: 1, justifyContent: "flex-end" }}>
          {canAddSong && (
            <Link href={`/song`} className={styles.linkHeading}>
              Criar música
            </Link>
          )}
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

      <div style={{ margin: "1rem 0", display: "flex", justifyContent: "center" }}>
        <input
          type="text"
          placeholder="Buscar por artista ou música..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <table className={styles.table}>
        <thead>
          <tr className={styles.tr} style={{ width: "100%" }}>
            <th className={styles.th}></th>
            <th
              className={styles.th}
              onClick={() => toggleSort("artist")}
              style={{ cursor: "pointer" }}
            >
              Artista {sortBy === "artist" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              className={styles.th}
              onClick={() => toggleSort("name")}
              style={{ cursor: "pointer" }}
            >
              Nome {sortBy === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th className={styles.th} style={{ width: "15%", textAlign: "center" }}>
              Editar Letra
            </th>
          </tr>
        </thead>
        <tbody className={styles.tb}>
          {finalSongs.length > 0 ? (
            finalSongs.map((song) => (
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
                {(song.createdByUser || isAdmin) && (
                  <td style={{ textAlign: "center" }}>
                    <Link href={`/song/${song.id}`}>
                      <FaPen />
                    </Link>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr className={styles.tr}>
              <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                Nenhuma música encontrada.
              </td>
            </tr>
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

      <div style={{ marginTop: "1rem", display: "flex", justifyContent: 'center', gap: '2rem' }}>
        <button onClick={handleStartPlaylist} className={styles.startButton}>
          Iniciar Playlist
        </button>
      <button onClick={baixarMusica} className={styles.startButton} disabled={playlist.length == 0} style={{cursor: playlist.length == 0 ? "not-allowed" : 'pointer'}}>
          Baixar Músiscas
        </button>
        <button onClick={handleGoogleLogin} className={styles.googleButton}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className={styles.googleIcon}
          />
          Entrar com Google
        </button>
      </div>
    </div>
  );
}

export default App;
