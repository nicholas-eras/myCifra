import ChordDiagram from "../../components/ChordDiagram";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  
  const { chord } = router.query;

  if (!chord || typeof chord !== 'string') return <p>Carregando...</p>;

  return (
    <main className="p-8">
      <ChordDiagram chordName={(chord.charAt(0).toUpperCase() + chord.slice(1) as string)} />
    </main>
  );
}
