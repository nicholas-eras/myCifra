import { useState } from "react";
import { useRouter } from "next/router";
import cifraService from "../../service/cifra.service";

export default function SyncCifra() {
  const [url, setUrl] = useState("");
  const [cifraJson, setCifraJson] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    if (!url) {
      alert("Informe a URL da música.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Verifica permissões no backend
      const response = await cifraService.verifyCifraUrl(url);
      if (!response || response.error) {
        throw new Error(response?.error || "Erro ao verificar URL");
      }

      // 2️⃣ Extrai artista e música da URL
      const regex = /cifraclub\.com\.br\/([^\/]+)\/([^\/]+)\/?/;
      const match = url.match(regex);
      if (!match) {
        throw new Error("URL inválida do CifraClub");
      }
      const artista = encodeURIComponent(match[1]);
      const musica = encodeURIComponent(match[2]);

      // 3️⃣ Monta a URL do scraper
      const scraperUrl = `http://192.168.155.153:3002/artists/${artista}/songs/${musica}`;

      // 4️⃣ Abre nova aba com a URL do scraper
      window.open(scraperUrl, "_blank");

      alert("A cifra foi aberta em uma nova aba.\nCopie o JSON retornado e cole no campo abaixo.");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!cifraJson) {
      alert("Cole o JSON retornado pelo scraper.");
      return;
    }

    try {
      const parsed = JSON.parse(cifraJson);
      // Aqui você chama seu serviço para salvar a música
      await cifraService.saveParsedCifra(parsed);

      alert("Cifra salva com sucesso!");
      router.push("/");
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar cifra: " + err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "1.5rem",
        background: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Sincronizar CifraClub
      </h2>
      <input
        type="text"
        placeholder="Cole a URL da música"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          marginBottom: "1rem",
        }}
      />
      <button
        onClick={handleSync}
        disabled={loading}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        {loading ? "Processando..." : "Verificar e abrir cifra"}
      </button>

      <h3 style={{ marginTop: "1rem" }}>
        Cole aqui o JSON retornado pelo scraper:
      </h3>
      <textarea
        placeholder="Cole o JSON aqui..."
        value={cifraJson}
        onChange={(e) => setCifraJson(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          padding: "0.5rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          marginBottom: "1rem",
        }}
      />

      <button
        onClick={handleSave}
        style={{
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Salvar cifra
      </button>

      <button
        onClick={() => router.push("/")}
        style={{
          backgroundColor: "#999",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
          marginTop: "0.5rem",
        }}
      >
        Voltar
      </button>
    </div>
  );
}
