import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { FaSearch, FaPen, FaPlus } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import songService from "../../service/app.service";
import { getUserPermissionsAndSongs, saveUserPermissionsAndSongs } from "../../service/indexedDb";
import usersService from "../../service/users.service";
import styles from "../../styles/index.module.css";

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
  const { artist } = router.query;

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
        if (!artist || typeof artist !== "string") return;

        if (!navigator.onLine) {
        const offlineData = await getUserPermissionsAndSongs();
        if (offlineData) {
            setSongList(offlineData.songs || []);
            setIsAdmin(offlineData.isAdmin || false);
            setCanAddSong(offlineData.canAddSong || false);
            setCanSyncCifra(offlineData.canSyncCifra || false);
        }
        return;
        }

        try {
        const [songsData, userData] = await Promise.all([
            songService.getSongsByArtist(artist),
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
        const offlineData = await getUserPermissionsAndSongs();
        if (offlineData) {
            setSongList(offlineData.songs || []);
            setIsAdmin(offlineData.isAdmin || false);
            setCanAddSong(offlineData.canAddSong || false);
            setCanSyncCifra(offlineData.canSyncCifra || false);
        }
        }
    };

    fetchData();
    }, [artist]);

  if (!artist || typeof artist !== "string") {
    return <p>Carregando...</p>;
  }

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
    <>
      <div className={styles.headingRow}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img src="/myCifra.svg" alt="MyCifra" style={{ height: "40px" }} />
            <span style={{ fontSize: "1.8rem", fontWeight: "bold", color: "white" }}>MyCifra</span>
          </div>

        </div>
      <div className={styles["table-container"]}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar por artista ou música..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>
              <FaSearch />
            </span>
          </div>
        </div>

        <div className={styles.songList}>
          {
            finalSongs.map((song) => (
              <div key={song.id} className={styles.song}>
                <div className={styles.iconTd} onClick={() => handleSelectSong(song.id)}>
                  {!playlist.includes(song.id) ? (
                    <MdOutlineRadioButtonUnchecked />
                  ) : (
                    <FaCircleCheck style={{ color: "#DFF157" }} />
                  )}
                </div>

                <div className={styles.td}>
                  <Link href={`/${song.id}`} className={styles.link} style={{fontWeight: "bold", fontSize: "1.2rem"}}>
                    {song.name}
                  </Link>
                  <Link href={`/artist/${song.artist}`} className={styles.link} style={{fontSize: ".9rem"}}>
                    {song.artist}
                  </Link>                
                </div>
                {(song.createdByUser || isAdmin) && (
                  <div style={{ textAlign: "center" }}>
                    <Link href={`/song/${song.id}`}>
                      <FaPen />
                    </Link>
                  </div>
                )}
              </div>
            ))
          }
        </div>
        
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: 'center', gap: '2rem' }}>
          
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
          <button onClick={handleGoogleLogin} className={styles.googleButton}>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className={styles.googleIcon}
            />
            Entrar com Google
          </button>
          <Link href="/">
            <button style={{
              padding: '5px 10px',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
              Voltar
            </button>
          </Link>
        </div>
      </div>
      <div className={`${styles.startButtonWrapper} ${playlist.length > 0 ? styles.visible : ""}`}>
        <button
          onClick={handleStartPlaylist}
          className={styles.startButton}
          disabled={playlist.length === 0}
          style={{ opacity: playlist.length === 0 ? 0.5 : 1 }}
        >
          <span className={styles.iconCircle}>
            <FaPlus className={styles.icon} />
          </span>
          INICIAR A PLAYLIST
        </button>
      </div>
    </>
  );
}

export default App;
