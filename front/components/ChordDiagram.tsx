"use client";

import React, { useEffect, useState } from "react";
import { findGuitarChord } from "chord-fingering";

// Transforma "x32010" em [-1, 3, 2, 0, 1, 0]
const parsePositionString = (str: string): number[] =>
  str.split("").map((char) => (char === "x" ? -1 : parseInt(char, 10)));

interface ChordDiagramProps {
  chordName: string;
}

const Fretboard: React.FC<{ shape: number[] }> = ({ shape }) => {
  const minFret = Math.min(...shape.filter((f) => f > 0));
  const fretOffset = minFret === Infinity ? 1 : minFret;
  const fretCount = 4;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Fundo branco */}
      <rect x="0" y="0" width="140" height="140" fill="white" />

      {/* Indicador da casa (caixa preta com número branco) */}
      {/* <rect x="0" y="40" width="15" height={fretCount * 20} fill="#222" rx={4} ry={4} /> */}
      {fretOffset > 1 && (
        <text
          x={7.5}
          y={40 + (0 * 20) / 2 - 4}
          fontSize="12"
          fill="black"
          textAnchor="middle"
          fontWeight="bold"
        >
          {fretOffset}
        </text>
      )}

      {/* Cordas verticais */}
      {[...Array(6)].map((_, i) => (
        <line
          key={`string-${i}`}
          x1={(i + 1) * 20}
          y1="20"
          x2={(i + 1) * 20}
          y2="120"
          stroke="black"
        />
      ))}

      {/* Trastes horizontais */}
      {[...Array(fretCount)].map((_, i) => (
        <line
          key={`fret-${i}`}
          x1="20"
          y1={40 + i * 20}
          x2="120"
          y2={40 + i * 20}
          stroke="black"
        />
      ))}

      {/* Notas pressionadas */}
      {shape.map((fret, i) => {
        console.log(fret, fretOffset, i);
        if (fret <= 0) return null;
        return (
          <circle
            key={`note-${i}`}
            cx={(i + 1) * 20}
            cy = {50 + (fret - fretOffset-1) * 20}
            r="6"
            fill="black"
          />
        );
      })}

      {/* Cordas soltas ou mudas */}
      {shape.map((fret, i) =>
        fret === 0 ? (
          <text
            key={`open-${i}`}
            x={(i + 1) * 20}
            y="15"
            fontSize="10"
            textAnchor="middle"
          >
            O
          </text>
        ) : fret === -1 ? (
          <text
            key={`mute-${i}`}
            x={(i + 1) * 20}
            y="15"
            fontSize="10"
            textAnchor="middle"
          >
            X
          </text>
        ) : null
      )}
    </svg>
  );
};

const ChordDiagram: React.FC<ChordDiagramProps> = ({ chordName }) => {
  const result = findGuitarChord(chordName);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!result || !result.fingerings || result.fingerings.length === 0) {
    return <div>Acorde "{chordName}" não encontrado.</div>;
  }
  useEffect(() =>{
    console.log(currentIndex);
    console.log(result);
  }, [currentIndex]);
  const total = result.fingerings.length;
  const fingering = result.fingerings[currentIndex];
  const shape = parsePositionString(fingering.positionString);

  const next = () => setCurrentIndex((i) => (i + 1) % total);
  const prev = () => setCurrentIndex((i) => (i - 1 + total) % total);

  return (
    <div className="text-center my-4">
      <h3 className="text-lg font-semibold mb-2">{chordName}</h3>
      <Fretboard shape={shape} />
      <div className="flex justify-center items-center gap-4 mt-2">
        <button onClick={prev} className="px-2 py-1 bg-gray-200 rounded">◀️</button>
        <span className="text-sm">
          {currentIndex + 1} / {total}
        </span>
        <button onClick={next} className="px-2 py-1 bg-gray-200 rounded">▶️</button>
      </div>
      <p className="mt-1 text-xs text-gray-600">
        {fingering.positionString}
        {fingering.barre && ` — Pestana na casa ${fingering.barre.fret}`}
      </p>
    </div>
  );
};

export default ChordDiagram;
