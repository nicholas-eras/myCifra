const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const cifraService = {
  async verifyCifraUrl(url: string): Promise<any> {
    const res = await fetch(`${API_URL}/cifra/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ url }),
    });
    if (!res.ok) console.log("Erro ao verificar URL");
    return res.json();
  },

  async saveParsedCifra(data: any): Promise<any> {
    const res = await fetch(`${API_URL}/cifra/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) console.log("Erro ao salvar cifra");
    return res.json();
  },
};

export default cifraService;
