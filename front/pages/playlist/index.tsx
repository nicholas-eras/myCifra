import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Song from "../[songId]";

export default function PlaylistPlayer() {
  const router = useRouter();
  const { ids } = router.query;

  const [playlist, setPlaylist] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (ids) {
      const idArray = (Array.isArray(ids) ? ids[0] : ids)
        .split(",")
        .map((id) => parseInt(id))
        .filter((n) => !isNaN(n));
      setPlaylist(idArray);
      setCurrentIndex(0);
    }
  }, [ids]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? playlist.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === playlist.length - 1 ? 0 : prev + 1
    );
  };

  if (playlist.length === 0) {
    return <div style={{ padding: "1rem" }}>Carregando playlist...</div>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
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
          Música {currentIndex + 1} de {playlist.length}
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
