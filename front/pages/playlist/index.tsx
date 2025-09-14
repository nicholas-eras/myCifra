import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Song from "../[songId]";

export default function PlaylistPlayer() {
  const router = useRouter();
  const { ids } = router.query;

  const [playlist, setPlaylist] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Referências para acumular mudanças
  const pendingIndex = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (ids) {
      const idArray = (Array.isArray(ids) ? ids[0] : ids)
        .split(",")
        .map((id) => parseInt(id))
        .filter((n) => !isNaN(n));
      setPlaylist(idArray);
      setCurrentIndex(0);
      pendingIndex.current = 0;
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

  if (playlist.length === 0) {
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

      <Song songId={playlist[currentIndex]} />
    </div>
  );
}
