import ChordDiagram from "../../components/ChordDiagram";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Acorde: C</h1>
      <ChordDiagram chordName="C" />
    </main>
  );
}
