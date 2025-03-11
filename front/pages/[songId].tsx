import { useEffect, useState } from 'react';
import styles from '../styles/app.module.css';
import { useRouter } from "next/router";
import songService from '../service/app.service';
import Link from 'next/link';

function Song() {
  const router = useRouter();
  const { songId } = router.query;
  const [song, setSong] = useState<any | null>(null);
  const [lyricBlocks, setLyricBlocks] = useState<any[][]>([]);
  const [tempChordsCounter, setTempChordsCounter] = useState<number>(0);

  const tunes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  const fontSize = 16;
  const fontSizeRelativeDiv = 90;
  const chordCharSize = fontSizeRelativeDiv * fontSize / 100;

  const numRowsPerColumn = 20;  

  const fetchSongData = async(id: number) =>  {      
    const data = await songService.getSongById(id);
    setSong(data);                     
  }
    
  useEffect(() => {    
    if (songId) {
      fetchSongData(+songId);
    }
  }, [songId]);

  useEffect(() => {
    if (!song || !song.lyrics) {return}

    const numberOfColumns = Math.ceil(song.lyrics.length / numRowsPerColumn);
    const initialChordBlocks: any[][] = Array.from({ length: numberOfColumns }, () => []);        

    song.lyrics.forEach((lyrics: { lineIndex: number; chords: any; }) => {
      const rowIndex = Math.floor(lyrics.lineIndex / numRowsPerColumn);
      initialChordBlocks[rowIndex].push(lyrics);
    });
    setLyricBlocks(initialChordBlocks);
  }, [song]);
  
  if (!song) {
    return <div>Loading...</div>;
  }

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>,
    lyricId: number,
    blockId: number,
    rowId: number,
    wordIndex: number
  ) => {        
    const mouseX: number = e.clientX;
    const div = e.currentTarget.getBoundingClientRect();    
    const divX: number = div.left;
    
    const chordMinWidthRelative = 0.25;
    const chordMinWidthPixel = chordMinWidthRelative * div.width;
    
    const chordToPlaceMargin: number = (mouseX - divX - chordMinWidthPixel / 2);
    const chordToPlaceLeftMargin: number = (chordToPlaceMargin / (div.width) * 100); 

    const element = document.createElement("input");
    element.style.width = `${chordMinWidthPixel}px`;
    element.style.height = `50%`;
    element.style.position = "absolute";
    element.style.background = "transparent";
    element.style.marginLeft = `${chordToPlaceLeftMargin}%`;
    element.style.zIndex = "10";
    element.style.border = "none";
    element.style.color = "orange";
    element.style.fontWeight = "bold";
    element.style.fontSize = `${fontSizeRelativeDiv}%`;

    setTempChordsCounter(tempChordsCounter + 1);
    const chordTempId = -1 * parseInt(`${blockId}${rowId}${tempChordsCounter}`);

    element.addEventListener('blur', () => {

      if (element.value.trim() === "") {
        element.remove(); 
        return;
      }

      const newChord: any = {
        id: chordTempId,
        lyricId: lyricId,
        chord: element.value,
        width: element.style.width,
        offset: parseFloat(element.style.marginLeft.replace("%", "")) / 100,
        position: +wordIndex
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
  
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteChord(chordTempId);
      if (element.parentElement) {
        element.remove();
      }      
    });
  
    const adjustWidth = () => {
      element.style.width = `${Math.max(element.scrollWidth, chordMinWidthPixel) + 1}px`;
    };
  
    element.addEventListener('input', adjustWidth);
    e.currentTarget.appendChild(element);
    element.focus();
  };

  const handleDeleteChord = (chordId: number) => {
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
      lyrics: lyricBlocks.flat()
    };

    try {
      await songService.updateSongChords(song.id, payload);  
      alert('Música atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar música:', error);
      alert('Erro ao atualizar música');
    }
  };

  const changeTune = (increment: string) => {
    setSong((prevSong: { lyrics: any[]; }) => ({
      ...prevSong,
      lyrics: prevSong.lyrics?.map((lyric) => ({
        ...lyric,
        chords: lyric.chords.map((chordInfo: any) => {
          const { chord: newChord, width: newWidth } = changeChord(chordInfo.chord, increment, chordInfo.width);
          return {
            ...chordInfo,
            chord: newChord,
            width: newWidth
          };
        }),
      })),
    }));
  };  

  const changeChord = (chord: string, increment: string, currentWidth: string) => {   
    let chordCopy = chord;
    let newChord = [];
    let currentTune;    
    for (let i = 0; i < chordCopy.length; i++){      
      currentTune = chordCopy[i];
      if (!tunes.includes(currentTune) && (chordCopy[i] === "#" || chordCopy[i] === "b")){
        continue;
      }    
      if (currentTune == "#" && newChord[i-1] == "E"){
        newChord[i-1] = "F";
        currentTune = "";
      }
      if (currentTune == "b" && newChord[i-1] == "F"){
        newChord[i-1] = "E";
        currentTune = "";
      }     
      if (chordCopy[i+1] == "#" || chordCopy[i+1] == "b"){
        currentTune = chordCopy.substring(i, i+2);        
      }        
      let currentTuneIndex = tunes.indexOf(currentTune);    
      if (increment === "+"){
        while (currentTuneIndex >= tunes.length - 1){      
          currentTuneIndex -= tunes.length;
        }  
      }
      else{
        while (currentTuneIndex <= 0){
          currentTuneIndex += tunes.length;
        }
      }        
      currentTune = tunes.includes(currentTune) ?
        tunes[increment === "+" ? currentTuneIndex + 1 : currentTuneIndex - 1]
        : currentTune;    
      newChord.push(currentTune);
    }

    const widthValue:number = +currentWidth.split("px")[0];
    const newWidthValue = `${1.5*newChord.join("").length }ch`;
    console.log(chord, newChord.join(""), currentWidth, newWidthValue);
    return {
      chord: newChord.join(""),
      width: newWidthValue
    };
  }

  return (
    <>
      <div className={styles["cifra-container"]}>
        <div className={styles["song-info"]}>
          <div className={styles["composer"]}>
            <div>{song.name}</div>
            <div>{song.artist}</div>
          </div>
          <div className={styles["action"]}>
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
        <div className={styles["tune"]}>
          <button onClick={()=>changeTune("-")}>-</button>
          <button onClick={()=>changeTune("+")}>+</button>
        </div>
        <div className={styles["lyric"]} id='blocksContainer'>
          {lyricBlocks.map((block, i) => (
            <div className={styles["lyric-block"]} key={`block-${i}`}>
              {block.map((lyric, j) => {     
                return (
                  <div key={`block-${i}-row-${j}`} id={`block-${i}-row-${j}`} className={styles["lyric-container"]}>
                    {lyric.text === "" ? (
                      <div
                        className={styles["lyric-row"]}
                        key={`block-${i}-row-${j}-blank`}
                        onClick={(e) => handleClick(e, lyric.id, i, j, 0)}
                        style={{
                          fontSize: `${fontSizeRelativeDiv}%`,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          position: "relative",
                        }}
                      >                         
                        {lyric.chords.map((chord: any, k: any) => (
                          <div
                            key={`block-${i}-row-${j}-chord-${k}`}
                            className={styles["word-chord"]}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              position: "relative",
                            }}
                          >
                            <input
                              style={{
                                width: chord.width || "auto",
                                marginLeft: `${chord.offset * 100}%`,
                                background: "transparent",
                                border: "none",
                                color: "orange",
                                fontWeight: "bold",
                                fontSize: `${fontSizeRelativeDiv}%`,
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
                                handleDeleteChord(chord.id);
                              }}
                              value={chord.chord}
                            />
                            <span className={styles["word"]}> </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={styles["lyric-row"]}
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          fontSize: `${fontSizeRelativeDiv}%`,
                          position: "relative",
                        }}
                      >
                        {j === 0 && (
                          <div
                            className="counter"
                            style={{
                              position: "absolute",
                              marginLeft: "-1rem",
                            }}
                          >
                            {i + 1}
                          </div>
                        )}
                         {lyric.text.split(" ").map((word: any, wordIndex: any) => {
                          const chords = lyric.chords.filter((c: any) => c.position === wordIndex);
                          return (
                            <div
                              key={`block-${i}-row-${j}-word-${wordIndex}`}
                              style={{ /* word-chord */
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                position: "relative",
                                gap: "1rem",
                              }}
                              onClick={(e) => handleClick(e, lyric.id, i, j, wordIndex)}
                            >
                              <span
                                style={{ /* chord-placeholder */
                                  height: `${fontSizeRelativeDiv}%`,
                                  width: "100%",
                                  display: "block",
                                  position: "relative",
                                }}
                              >
                                {chords.map((chord: any, chordIndex: any) => (
                                  <input
                                    key={`block-${i}-row-${j}-chord-${wordIndex}-${chordIndex}`}
                                    style={{
                                      width: chord.width || "auto",
                                      left: `${chord.offset * 100}%`,
                                      background: "transparent",
                                      color: "orange",
                                      border: "1px solid transparent",
                                      fontWeight: "bold",
                                      fontSize: `${fontSizeRelativeDiv}%`,
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
                                      handleDeleteChord(chord.id);
                                    }}
                                    value={chord.chord}
                                  />
                                ))}
                              </span>
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {word}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Song