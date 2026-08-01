import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Song from "../[songId]";
import songService from "../../service/app.service";

export default function PlaylistPlayer() {
  const router = useRouter();
  const { ids } = router.query;

  // Agora guarda os objetos completos das músicas
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Referências para acumular mudanças
  const pendingIndex = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (ids) {
      const idArray = (Array.isArray(ids) ? ids[0] : ids)
        .split(",")
        .map((id) => parseInt(id))
        .filter((n) => !isNaN(n));

      const fetchAllSongs = async () => {
        setIsLoading(true);
        try {
          // Busca todas as músicas simultaneamente
          const songsData = await Promise.all(
            idArray.map((id) => songService.getSongById(id))
          );
          
          // Filtra possíveis nulls/erros e salva a playlist completa
          setPlaylist(songsData.filter(Boolean));
          setCurrentIndex(0);
          pendingIndex.current = 0;
        } catch (error) {
          console.error("Erro ao carregar playlist:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAllSongs();
    }
  }, [ids]);

  const updateIndexWithDebounce = (newIndex: number) => {
    pendingIndex.current = newIndex;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setCurrentIndex(pendingIndex.current);
      debounceTimer.current = null;
    }, 250);
  };

  const goToPrevious = () => {
    const newIndex =
      pendingIndex.current === 0
        ? playlist.length - 1
        : pendingIndex.current - 1;
    updateIndexWithDebounce(newIndex);
  };

  const goToNext = () => {
    const newIndex =
      pendingIndex.current === playlist.length - 1
        ? 0
        : pendingIndex.current + 1;
    updateIndexWithDebounce(newIndex);
  };

  if (isLoading || playlist.length === 0) {
    return <div style={{ padding: "1rem" }}>Carregando playlist...</div>;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={goToPrevious}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← Anterior
        </button>

        <div style={{ fontWeight: "bold" }}>
          Música {pendingIndex.current + 1} de {playlist.length}
        </div>

        <button
          onClick={goToNext}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Próxima →
        </button>
      </div>

      {/* Passa o dado da música diretamente em vez do ID */}
      <Song initialSongData={playlist[currentIndex]} />
    </div>
  );
}