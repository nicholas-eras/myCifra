import { useEffect, useState } from "react";
import styles from "../styles/index.module.css";
import songService from "../service/app.service";
import usersService from "../service/users.service";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import { FaFilter, FaPen, FaSearch } from "react-icons/fa";
import { useRouter } from "next/router";
import { saveSongOffline, getOfflineSongs, saveUserPermissionsAndSongs, getUserPermissionsAndSongs } from '../service/indexedDb';
import { FaCircleCheck } from "react-icons/fa6";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { FaPlus } from "react-icons/fa";

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
    const songs = await songService.getAllSongsWithLyrics();    
    await saveSongOffline(songs!.songs);
    alert('Músicas salvas para uso offline!');
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
    <>
      <div className={styles.headingRow}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img src="/myCifra.svg" alt="MyCifra" style={{ height: "40px" }} />
            <span style={{ fontSize: "1.8rem", fontWeight: "bold", color: "white" }}>MyCifra</span>
          </div>

          <div>
            <ThemeToggle />
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

          {/* <button className={styles.filterButton}>
            <FaFilter />
          </button> */}
        </div>

        <div className={styles.songList}>
          {
            finalSongs.map((song) => (
              <div key={song.id} className={styles.song}>
                <td className={styles.iconTd} onClick={() => handleSelectSong(song.id)}>
                  {!playlist.includes(song.id) ? (
                    <MdOutlineRadioButtonUnchecked
                    />
                  ) : (
                    <FaCircleCheck
                      style={{ color: "#DFF157" }}
                    />
                  )}
                </td>
                <td className={styles.td}>
                  <Link href={`/${song.id}`} className={styles.link} style={{fontWeight: "bold", fontSize: "1.25rem"}}>
                    {song.name}
                  </Link>
                  <Link href={`/${song.id}`} className={styles.link} style={{fontSize: ".75rem"}}>
                    {song.artist}
                  </Link>                
                </td>
                {(song.createdByUser || isAdmin) && (
                  <td style={{ textAlign: "center" }}>
                    <Link href={`/song/${song.id}`}>
                      <FaPen />
                    </Link>
                  </td>
                )}
              </div>

            ))
          }
        </div>
        
        {/* <div style={{ marginTop: "1rem", display: "flex", justifyContent: 'center', gap: '2rem' }}>
          <button onClick={handleStartPlaylist} className={styles.startButton}>
            <span className={styles.iconCircle}>
              <FaPlus className={styles.icon} />
            </span>
            INICIAR A PLAYLIST
          </button>
          <button onClick={baixarMusica} className={styles.startButton}>
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
        </div> */}
      </div>
      <div className={`${styles.startButtonWrapper} ${playlist.length > 0 ? styles.visible : ""}`}>
        {playlist.length > 0 && (
          <div className={styles.playlistText}>
            <strong>Playlist:</strong>{" "}
            {playlist
              .map((id) => {
                const song = songList.find((s) => s.id === id);
                return song ? song.name : "";
              })
              .filter((name) => name)
              .join(", ")}
          </div>
        )}
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
