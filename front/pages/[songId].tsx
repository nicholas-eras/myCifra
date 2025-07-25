import { useEffect, useRef, useState } from 'react';
import styles from '../styles/app.module.css';
import { useRouter } from "next/router";
import songService from '../service/app.service';
import Link from 'next/link';
import { TbColumns } from "react-icons/tb";
import { RxColumns } from "react-icons/rx";
import { MdOutlineTextIncrease } from "react-icons/md";
import { MdOutlineTextDecrease } from "react-icons/md";
import { FaPen } from "react-icons/fa";
import { IoMusicalNotesOutline } from "react-icons/io5";
import { IoMusicalNotes } from "react-icons/io5";
import { HiHashtag } from "react-icons/hi2";
import ChordDiagram from '../components/ChordDiagram';
import { IoEyeSharp } from "react-icons/io5";
import Metronomo from '../components/Metronomo';
import { PiMetronomeLight } from "react-icons/pi";
import { PiMetronomeFill } from "react-icons/pi";
import usersService from "../service/users.service";
import { getOfflineSong, saveSongOffline } from '../service/indexedDb';

function Song({ songId: propSongId }: { songId?: number }) {
  const router = useRouter();
  const routerSongId = router.query.songId;

  // Prioriza prop se vier
  const finalSongId = propSongId ?? (routerSongId ? +routerSongId : undefined);

  const [song, setSong] = useState<any | null>(null);
  const [lyricBlocks, setLyricBlocks] = useState<any[][]>([]);
  const [tempChordsCounter, setTempChordsCounter] = useState<number>(0);
  const [isOneColumn, setIsOneColumn] = useState(true);
  const [isLyricOnly, setIsLyricOnly] = useState(false);
  const [chordsPreferences, setChordsPreferences] = useState<Record<number, "#" | "b">>({});
  const [generalPreference, setGeneralPreference] = useState<string>("");
  const [visibleChord, setVisibleChord] = useState<null | { chordName: string; x: number; y: number }>(null);
  const [canEditChords, setCanEditChords] = useState(false);
  const [showMetronomo, setShowMetronomo] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const appliedTranspose = useRef(false);

  const tunes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const tunesBemol = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  const [fontSize, setFontSize] = useState(16);
  const fontSizeRelativeDiv = 100;

  const numRowsPerColumn = 20;

  const fetchSongData = async (id: number) => {
    let data;

    if (navigator.onLine) {
      try {
        data = await songService.getSongById(id);
        // await saveSongOffline(data);
      } catch (error) {
        console.warn("Erro ao buscar online. Tentando offline...");
        data = await getOfflineSong(id);
      }
    } else {
      data = await getOfflineSong(id);
    }

    if (!data) {
      console.error("Música não encontrada nem online nem offline.");
      return;
    }
    const normalizedLyrics = data.lyrics.map((lyric: any) => ({
      ...lyric,
      chords: lyric.chords.map((chord: any) => ({
        ...chord,
        idOriginal: chord.id,
        id: `${lyric.id}-${chord.id}`, // apenas para o front, pois da bug na hora de excluir
      })),
    }));

    setSong({ ...data, lyrics: normalizedLyrics });
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await usersService.getMe();
        setIsAdmin(userData.isAdmin);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setIsAdmin(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (finalSongId) {
      appliedTranspose.current = false; // resetar sempre que mudar música
      fetchSongData(+finalSongId);
    }
  }, [finalSongId]);

  useEffect(() => {
    if (!song || !song.lyrics) { return }

    const numberOfColumns = Math.ceil(song.lyrics.length / numRowsPerColumn);
    const initialChordBlocks: any[][] = Array.from({ length: numberOfColumns }, () => []);

    song.lyrics.forEach((lyrics: { lineIndex: number; chords: any; }) => {
      const rowIndex = Math.floor(lyrics.lineIndex / numRowsPerColumn);
      initialChordBlocks[rowIndex].push(lyrics);
    });
    setLyricBlocks(initialChordBlocks);
  }, [song]);

  useEffect(() => {
    const lyric = document.getElementById("blocksContainer");
    if (lyric) {
      isOneColumn ?
        lyric.style.gridTemplateColumns = "repeat(1, 1fr)" :
        lyric.style.gridTemplateColumns = "repeat(2, 1fr)";
    }
  }, [isOneColumn])

  useEffect(() => {
    setGeneralPreference("");

    setSong((prevSong: { lyrics: any[]; }) => {
      if (!prevSong || !prevSong.lyrics) return prevSong; // impede erro

      return {
        ...prevSong,
        lyrics: prevSong.lyrics.map((lyric: { chords: any[]; }) => ({
          ...lyric,
          chords: lyric.chords.map((chordInfo: { id: any; chord: string; }) => {
            const chordId = chordInfo.id;
            let preference: "#" | "b";

            if (chordsPreferences[chordId]) {
              preference = chordsPreferences[chordId];
            } else if (chordInfo.chord.includes("#")) {
              preference = "#";
            } else if (chordInfo.chord.includes("b")) {
              preference = "b";
            } else {
              preference = "#";
            }

            const restoredChord = convertChordToPreference(chordInfo.chord, preference);

            return {
              ...chordInfo,
              chord: restoredChord,
              width: `${1 + restoredChord.length}ch`
            };
          })
        }))
      };
    });
  }, [isLyricOnly]);

  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setVisibleChord(null);
      }
    }

    // Adiciona o listener apenas quando o popover está visível
    if (visibleChord) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visibleChord]); // Dependência apenas do visibleChord

  function convertChordToPreference(chordStr: string, targetPreference: string): string {
    const mapBemolToSustenido: Record<string, string> = {
      "Bb": "A#",
      "Db": "C#",
      "Eb": "D#",
      "Gb": "F#",
      "Ab": "G#"
    };

    const mapSustenidoToBemol: Record<string, string> = {
      "A#": "Bb",
      "C#": "Db",
      "D#": "Eb",
      "F#": "Gb",
      "G#": "Ab"
    };

    if (targetPreference === "#") {
      return chordStr.replace(/(Bb|Db|Eb|Gb|Ab)/g, (match) => mapBemolToSustenido[match] || match);
    } else {
      return chordStr.replace(/(A#|C#|D#|F#|G#)/g, (match) => mapSustenidoToBemol[match] || match);
    }
  }

  useEffect(() => {
    if (generalPreference === "") return; // se ainda não tiver preferência, não faz nada

    setSong((prevSong: { lyrics: any[]; }) => ({
      ...prevSong,
      lyrics: prevSong.lyrics.map((lyric: { chords: any[]; }) => ({
        ...lyric,
        chords: lyric.chords.map((chordInfo: { chord: any; }) => ({
          ...chordInfo,
          chord: convertChordToPreference(chordInfo.chord, generalPreference)
          // largura pode ser recalculada se necessário:
          , width: `${1 + convertChordToPreference(chordInfo.chord, generalPreference).length}ch`
        }))
      }))
    }));
  }, [generalPreference]);

  useEffect(() => {
    if (!song || appliedTranspose.current) return;

    const stored = localStorage.getItem("songTranspositions");
    const parsed: Record<string, number> = stored ? JSON.parse(stored) : {};
    const savedIncrement = parsed[song.songId];

    if (savedIncrement && savedIncrement !== 0) {
      const absIncrement = Math.abs(savedIncrement);
      const direction = savedIncrement > 0 ? "+" : "-";

      for (let i = 0; i < absIncrement; i++) {
        applyTransposition(direction);
      }
    }

    // Marca que já aplicou
    appliedTranspose.current = true;
  }, [song]);

  const applyTransposition = (direction: string) => {
    setSong((prevSong: { lyrics: any[] }) => ({
      ...prevSong,
      lyrics: prevSong.lyrics?.map((lyric) => ({
        ...lyric,
        chords: lyric.chords.map((chordInfo: any) => {
          const { chord: newChord, width: newWidth } = changeChord(
            chordInfo.id,
            chordInfo.chord,
            direction,
            chordInfo.width
          );
          return {
            ...chordInfo,
            chord: newChord,
            width: newWidth,
          };
        }),
      })),
    }));
  };

  if (!song) {
    return (
      <>
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
        Loading...
      </>
    );
  }

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>,
    lyricId: number,
    blockId: number,
    rowId: number,
    wordIndex: number,
    height?: number,
  ) => {
    e.stopPropagation();
    if (!canEditChords){
      return
    }

    const mouseX: number = e.clientX;
    const div = e.currentTarget.getBoundingClientRect();
    const divX: number = div.left;

    const chordToPlaceMargin: number = (mouseX - divX - fontSize / 4);

    const chordToPlaceLeftMargin: number = (chordToPlaceMargin / (div.width) * 100);

    const element = document.createElement("input");
    element.style.width = `1.5ch`;
    element.style.height = height ? "100%" : `50%`;
    element.style.position = "absolute";
    element.style.background = "transparent";
    element.style.marginLeft = +wordIndex === -1 ? `${chordToPlaceMargin}px` : `${chordToPlaceLeftMargin}%`;
    element.style.zIndex = "10";
    element.style.border = "none";
    element.style.color = "orange";
    element.style.fontFamily = "monospace";
    element.style.fontWeight = "bold";
    element.style.fontSize = `${fontSizeRelativeDiv}%`;

    setTempChordsCounter(tempChordsCounter + 1);
    const chordTempId = Date.now() + Math.floor(Math.random() * 1000); // ID único

    element.addEventListener('blur', () => {

      if (element.value.trim() === "") {
        element.remove();
        return;
      }

      const newChord: any = {
        id: chordTempId,
        lyricId: lyricId,
        idOriginal: null,
        chord: element.value,
        width: element.style.width,
        offset: +wordIndex === -1 ? element.style.marginLeft : parseFloat(element.style.marginLeft.replace("%", "")) / 100,
        position: +wordIndex === -1 ? 0 : +wordIndex
      };

      element.remove();

      setSong((prevSong: any) => {
        const songCopy = { ...prevSong };
        songCopy.lyrics = songCopy.lyrics.map((lyric: any) => {
          if (lyric.id === lyricId) {
            return {
              ...lyric,
              chords: [...lyric.chords, newChord],
            };
          }
          return lyric;
        });
        return songCopy;
      });
    });

    element.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      handleDeleteChord(chordTempId);
      if (element.parentElement) {
        element.remove();
      }
    });

    const adjustWidth = () => {
      element.style.width = `${1 + element.value.length}ch`;
    };

    element.addEventListener('input', adjustWidth);

    e.currentTarget.appendChild(element);

    element.focus();
  };

  const handleDeleteChord = (chordId: string | number) => {
    setSong((prevSong: any) => {
      const newSong = {
        ...prevSong,
        lyrics: prevSong.lyrics?.map((lyric: any) => ({
          ...lyric,
          chords: lyric.chords.filter((chord: any) => chord.id !== chordId),
        })),
      };
      return newSong;
    });
  };

  const handleUpdateSong = async () => {
    if (!song) return;

    const payload = {
      name: song.name,
      artist: song.artist,
      lyrics: song.lyrics.map((lyric: any) => ({
        ...lyric,
        chords: lyric.chords.map(({ idOriginal, ...chord }: any) => ({
          ...chord,
          id: idOriginal, // usa o ID original do backend
        }))
      }))
    };

    try {
      await songService.updateSongChords(song.songId, payload);
      alert('Música atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar música:', error);
      alert('Erro ao atualizar música');
    }
  };


  const changeTune = (increment: string) => {
    const stored = localStorage.getItem("songTranspositions");
    const parsed: Record<string, number> = stored ? JSON.parse(stored) : {};

    const incrementValue = increment === "+" ? 1 : -1;

    const current = parsed[song.songId] ?? 0;
    parsed[song.songId] = current + incrementValue;

    localStorage.setItem("songTranspositions", JSON.stringify(parsed));

    setSong((prevSong: { lyrics: any[] }) => ({
      ...prevSong,
      lyrics: prevSong.lyrics?.map((lyric) => ({
        ...lyric,
        chords: lyric.chords.map((chordInfo: any) => {
          const { chord: newChord, width: newWidth } = changeChord(
            chordInfo.id,
            chordInfo.chord,
            increment,
            chordInfo.width
          );
          return {
            ...chordInfo,
            chord: newChord,
            width: newWidth,
          };
        }),
      })),
    }));
  };

  const changeChord = (
    chordId: number,
    chord: string,
    increment: string,
    currentWidth: string
  ) => {
    let chordCopy = chord;
    let newChord: string[] = [];
    let currentTune: string;

    // 1️⃣ Usa generalPreference direto do state (acessível aqui)
    // (ex: const [generalPreference, setGeneralPreference] = useState("");)

    let preference: "#" | "b";

    if (generalPreference === "#" || generalPreference === "b") {
      preference = generalPreference;

      // Converte toda cifra para a preferência geral
      chordCopy = convertChordToPreference(chord, preference);

    } else {
      // Lógica original de preferência individual

      preference = chordsPreferences[chordId] ?? null;

      if (!preference) {
        if (chord.includes("#")) {
          preference = "#";
        } else if (chord.includes("b")) {
          preference = "b";
        } else {
          preference = "#";
        }

        setChordsPreferences(prev => ({
          ...prev,
          [chordId]: preference!
        }));
      }
    }

    const scale = preference === "#" ? tunes : tunesBemol;

    function convertChordToPreference(chordStr: string, targetPreference: "#" | "b"): string {
      const mapBemolToSustenido: Record<string, string> = {
        "Bb": "A#",
        "Db": "C#",
        "Eb": "D#",
        "Gb": "F#",
        "Ab": "G#"
      };

      const mapSustenidoToBemol: Record<string, string> = {
        "A#": "Bb",
        "C#": "Db",
        "D#": "Eb",
        "F#": "Gb",
        "G#": "Ab"
      };

      if (targetPreference === "#") {
        return chordStr.replace(/(Bb|Db|Eb|Gb|Ab)/g, (match) => {
          return mapBemolToSustenido[match] || match;
        });
      } else {
        return chordStr.replace(/(A#|C#|D#|F#|G#)/g, (match) => {
          return mapSustenidoToBemol[match] || match;
        });
      }
    }

    for (let i = 0; i < chordCopy.length; i++) {
      currentTune = chordCopy[i];

      if (!tunes.includes(currentTune) && (currentTune === "#" || currentTune === "b")) {
        continue;
      }

      if (currentTune === "#" && newChord[i - 1] === "E") {
        newChord[i - 1] = "F";
        currentTune = "";
      }

      if (currentTune === "b" && newChord[i - 1] === "F") {
        newChord[i - 1] = "E";
        currentTune = "";
      }

      if (chordCopy[i + 1] === "#" || chordCopy[i + 1] === "b") {
        currentTune = chordCopy.substring(i, i + 2);
        i++; // pular próximo porque já usou
      }

      let currentTuneIndex = scale.indexOf(currentTune);

      if (currentTuneIndex === -1) {
        newChord.push(currentTune);
        continue;
      }

      currentTuneIndex = increment === "+"
        ? (currentTuneIndex + 1) % scale.length
        : (currentTuneIndex - 1 + scale.length) % scale.length;

      currentTune = scale[currentTuneIndex];
      newChord.push(currentTune);
    }

    const newWidthValue = `${1 + newChord.join("").length}ch`;
    return {
      chord: newChord.join(""),
      width: newWidthValue
    };
  };

  const resetTune = () => {
    const stored = localStorage.getItem("songTranspositions");
    if (stored) {
      const parsed: Record<string, number> = JSON.parse(stored);
      if (parsed[song.songId]) {
        delete parsed[song.songId];
        localStorage.setItem("songTranspositions", JSON.stringify(parsed));
      }
    }

    // Recarrega a música para restaurar o tom original
    appliedTranspose.current = false;
    fetchSongData(song.songId);
  };

  return (
    <>
      <div className={styles["cifra-container"]}>
        <div className={styles["song-info"]}>
          <div className={styles["composer"]}>
            <div>{song.name}</div>
            <div>{song.artist}</div>
          </div>
          <div className={styles["action"]}>
            {
              (song.createdByUser || isAdmin) &&               
              <button
                onClick={handleUpdateSong}
                style={{
                  padding: '5px 10px',
                  backgroundColor: 'green',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '1rem',
                }}
              >
                Atualizar Música
              </button>
            }
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
        <div className={styles["song-action"]}>
          <div className={styles["changeColumn"]}
            style={{
              position: "absolute",
              margin: ".5rem 0 0 1rem",
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
              alignItems: "baseline"
            }}
          >
            <div className="column-action">
              <RxColumns onClick={() => {
                setIsOneColumn(true);
              }}
                style={{
                  border: isOneColumn ? "1px solid black" : "none"
                }}
              />
              <TbColumns onClick={() => {
                setIsOneColumn(false);
              }}
                style={{
                  border: !isOneColumn ? "1px solid black" : "none"
                }}
              />
            </div>
            <div className="change-font-size-action">
              <MdOutlineTextIncrease onClick={() => {
                setFontSize(fontSize + 1);
              }} />
              <MdOutlineTextDecrease onClick={() => {
                setFontSize(fontSize - 1);
              }} />
              {isLyricOnly ?
                <IoMusicalNotesOutline onClick={() => setIsLyricOnly(false)} /> :
                <IoMusicalNotes onClick={() => setIsLyricOnly(true)} />
              }
              {!showMetronomo ? (
                <PiMetronomeLight  onClick={() => {
                    setShowMetronomo(!showMetronomo);
                }}/>
              ) : (
                <PiMetronomeFill  onClick={() => {
                  setShowMetronomo(!showMetronomo);
                }} />
              )}
              <HiHashtag style={{ marginLeft: '8px', marginRight: '4px', border: `${generalPreference == "#" ? 1 : 0}px solid black` }} onClick={() => {
                setGeneralPreference("#");
              }} />
              <span style={{ fontSize: "1.5rem", border: `${generalPreference == "b" ? 1 : 0}px solid black` }} onClick={() => {
                setGeneralPreference("b");
              }}>♭</span>
            </div>
            <div className="change-font-size-action" onClick={()=>setCanEditChords(!canEditChords)}>
              {
                canEditChords ? 
                <IoEyeSharp />
                :
                <FaPen />
              }
            </div>
          </div>
          <div className={styles["tune"]}>
            <button onClick={() => changeTune("-")}>-</button>
            <button onClick={() => changeTune("+")}>+</button>
            <button onClick={resetTune}>Tom Original</button>
          </div>
        </div>
        <div className={styles["lyric"]} id='blocksContainer'
          style={{
            fontSize: `${fontSize}px`
          }}
        >
          {lyricBlocks.map((block, i) => (
            <div className={styles["lyric-block"]} key={`block-${i}`}
              style={{
                border: isOneColumn ? "none" : "1px solid black"
              }}
            >
              {!isOneColumn && (<b>{i}</b>)}
              {block.map((lyric, j) => {
                return (
                  <div key={`block-${i}-row-${j}`} id={`block-${i}-row-${j}`} className={styles["lyric-container"]}>
                    {(() => {
                      const hasText = lyric.text.trim() !== "";
              const hasChords = lyric.chords.length > 0;

              // Caso: nada para mostrar
              // if (!hasText && !hasChords) {
              //   return null;
              // }

              // Caso: só letra
              if (isLyricOnly) {
                if (!hasText) { return (
                   <div
                    className={styles["lyric-row"]}
                    key={`block-${i}-row-${j}-blank`}
                    onClick={(e) => handleClick(e, lyric.id, i, j, -1, 100)}
                    style={{
                      fontSize: `calc(${fontSizeRelativeDiv} * ${fontSize})%`,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0 0.5rem",
                      position: "relative",
                      width: "100%",
                      height: "2ch",
                    }}
                  >
                    {lyric.chords.map((chord: any, k: any) => {console.log(chord); return (
                      <input
                        key={`block-${i}-row-${j}-${k}`}
                        style={{
                          width: chord.width || "auto",
                          marginLeft: `${typeof chord.offset === "string" && chord.offset.includes("px") ? chord.offset : chord.offset + "px"}`,
                          background: "transparent",
                          border: "none",
                          color: "orange",
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          position: "absolute",
                          fontSize: `${fontSize}px`,
                        }}
                        readOnly
                        value={chord.chord}
                      />
                    )})}
                  </div>
                  )}                
                return (
                  <div
                    className={styles["lyric-row"]}
                    style={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                    }}
                  >
                    {lyric.text}
                  </div>
                );
              }

              // Caso: só acordes
              if (!hasText && hasChords) {
                return (
                  <div
                    className={styles["lyric-row"]}
                    key={`block-${i}-row-${j}-chordsOnly`}
                    onClick={(e) => handleClick(e, lyric.id, i, j, -1, 100)}
                    style={{
                      fontSize: `calc(${fontSizeRelativeDiv} * ${fontSize})%`,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0 0.5rem",
                      position: "relative",
                      width: "100%",
                      height: "2ch",
                    }}
                  >
                    {lyric.chords.map((chord: any, k: any) => (
                      <input
                        key={`block-${i}-row-${j}-${k}`}
                        style={{
                          width: chord.width || "auto",
                          marginLeft: `${typeof chord.offset === "string" && chord.offset.includes("px") ? chord.offset : chord.offset + "px"}`,
                          background: "transparent",
                          border: "none",
                          color: "orange",
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          position: "absolute",
                          fontSize: `${fontSize}px`,
                        }}
                        readOnly
                        onMouseOver={(e) => {
                          e.currentTarget.style.cursor = "pointer";
                          e.currentTarget.style.border = "1px solid black";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.cursor = "default";
                          e.currentTarget.style.border = "none";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const target = e.currentTarget;
                          if (clickTimeout.current) {
                            clearTimeout(clickTimeout.current);
                            clickTimeout.current = null;
                          } else {
                            clickTimeout.current = setTimeout(() => {
                              clickTimeout.current = null;
                              const rect = target.getBoundingClientRect();
                              setVisibleChord({
                                chordName: chord.chord,
                                x: rect.left,
                                y: rect.top,
                              });
                            }, 250);
                          }
                        }}
                        onDoubleClick={(e) => {
                          if (!canEditChords) return;
                          if (clickTimeout.current) {
                            clearTimeout(clickTimeout.current);
                            clickTimeout.current = null;
                          }
                          e.stopPropagation();
                          handleDeleteChord(chord.id);
                        }}
                        value={chord.chord}
                      />
                    ))}
                  </div>
                );
              }

              if (!hasText && !hasChords){
                return (
                <div
                  className={styles["lyric-row"]}
                  key={`block-${i}-row-${j}-blank`}
                  onClick={(e) => handleClick(e, lyric.id, i, j, -1, 100)}
                  style={{
                    fontSize: `calc(${fontSizeRelativeDiv} * ${fontSize})%`,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0 0.5rem",
                    position: "relative",
                    width: "100%",
                    height: "2ch",
                  }}
                >
                  {!isLyricOnly && lyric.chords.map((chord: any, k: any) => (
                    <input
                      key={`block-${i}-row-${j}-${k}`}
                      style={{
                        width: chord.width || "auto",
                        marginLeft: `${typeof chord.offset === "string" && chord.offset.includes("px") ? chord.offset : chord.offset + "px"}`,
                        background: "transparent",
                        border: "none",
                        color: "orange",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        position: "absolute",
                        fontSize: `${fontSize}px`,
                      }}
                      readOnly
                      onMouseOver={(e) => {
                        e.currentTarget.style.cursor = "pointer";
                        e.currentTarget.style.border = "1px solid black";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.cursor = "default";
                        e.currentTarget.style.border = "none";
                      }}
                      onClick={(e) => {
                        e.stopPropagation();                    
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChord(chord.id);
                      }}
                      value={chord.chord}
                    />
                  ))}
                </div>
                )
              }

              // Caso: letra e possivelmente acordes
              return (
                <div
                  className={styles["lyric-row"]}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0 0.5rem",
                    fontFamily: "monospace",
                    position: "relative",
                  }}
                >
                  {lyric.text.split(" ").map((word: any, wordIndex: any) => {
                    const chords = lyric.chords.filter((c: any) => c.position === wordIndex);
                    const maxExtent = chords.reduce((max: number, chord: any) => {
                      const extent = parseFloat(chord.width + 1 || 0) + (parseFloat(chord.offset || 0)) * parseFloat(word.length + 1 || 0);
                      return extent > max ? extent : max;
                    }, 0);
                    const spanChordWidth = Math.max(maxExtent, word.length);
                    return (
                      <div
                        key={`block-${i}-row-${j}-word-${wordIndex}`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          position: "relative",
                        }}
                        onClick={(e) => handleClick(e, lyric.id, i, j, wordIndex)}
                      >
                        <span
                          style={{
                            height: `${fontSize}px`,
                            width: `${spanChordWidth}ch`,
                            display: "block",
                            position: "relative",
                          }}
                        >
                          {chords.map((chord: any, chordIndex: any) => (
                            <input
                              key={`block-${i}-row-${j}-chord-${wordIndex}-${chordIndex}`}
                              style={{
                                width: chord.width || "auto",
                                left: `${chord.offset * word.length}ch`,
                                background: "transparent",
                                color: "orange",
                                border: "1px solid transparent",
                                fontWeight: "bold",
                                fontSize: `${fontSize}px`,
                                fontFamily: "monospace",
                                top: 0,
                                position: "absolute",
                              }}
                              readOnly
                              onMouseOver={(e) => {
                                e.currentTarget.style.cursor = "pointer";
                                e.currentTarget.style.border = "1px solid black";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.cursor = "default";
                                e.currentTarget.style.border = "1px solid transparent";
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const target = e.currentTarget;
                                if (clickTimeout.current) {
                                  clearTimeout(clickTimeout.current);
                                  clickTimeout.current = null;
                                } else {
                                  clickTimeout.current = setTimeout(() => {
                                    clickTimeout.current = null;
                                    const rect = target.getBoundingClientRect();
                                    setVisibleChord({
                                      chordName: chord.chord,
                                      x: rect.left,
                                      y: rect.top,
                                    });
                                  }, 250);
                                }
                              }}
                              onDoubleClick={(e) => {
                                if (!canEditChords) return;
                                if (clickTimeout.current) {
                                  clearTimeout(clickTimeout.current);
                                  clickTimeout.current = null;
                                }
                                e.stopPropagation();
                                handleDeleteChord(chord.id);
                              }}
                              value={chord.chord}
                            />
                          ))}
                          {visibleChord && (
                            <div
                              ref={popoverRef} // Adiciona a ref aqui
                              style={{
                                position: 'fixed',
                                left: visibleChord.x + 50,
                                top: visibleChord.y - 100,
                                zIndex: 999,
                                background: 'white',
                                padding: 4,
                                border: '1px solid black',
                                borderRadius: 4,
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ChordDiagram chordName={visibleChord.chordName} />
                            </div>
                          )}
                        </span>
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            fontFamily: "monospace",
                          }}
                        >
                          {word}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {showMetronomo && (
        <div className={styles["metronomo"]}>
          <Metronomo defaultBpm={120}/>
        </div>
      )}
    </>
  );
}

export default Song