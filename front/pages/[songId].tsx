import { useEffect, useState } from 'react';
import styles from '../styles/app.module.css';
import { useRouter } from "next/router";
import songService from '../service/app.service';
import Link from 'next/link';
import { TbColumns } from "react-icons/tb";
import { RxColumns } from "react-icons/rx";
import { MdOutlineTextIncrease } from "react-icons/md";
import { MdOutlineTextDecrease } from "react-icons/md";
import { FaPen } from "react-icons/fa";

function Song() {
  const router = useRouter();
  const { songId } = router.query;
  const [song, setSong] = useState<any | null>(null);
  const [lyricBlocks, setLyricBlocks] = useState<any[][]>([]);
  const [tempChordsCounter, setTempChordsCounter] = useState<number>(0);
  const [isOneColumn, setIsOneColumn] = useState(true);

  const tunes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  const [fontSize, setFontSize] = useState(16);
  const fontSizeRelativeDiv = 100;

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
  
  useEffect(() => {
    const lyric = document.getElementById("blocksContainer");
    if (lyric){
      isOneColumn ? 
      lyric.style.gridTemplateColumns = "repeat(1, 1fr)" :
      lyric.style.gridTemplateColumns = "repeat(2, 1fr)";  
    }    
  }, [isOneColumn])

  if (!song) {
    return <div>Loading...</div>;
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

    const mouseX: number = e.clientX;
    const div = e.currentTarget.getBoundingClientRect();    
    const divX: number = div.left;
    
    const chordMinWidthCH = 1;
    const chordMinWidthPixel = fontSize * chordMinWidthCH;
    const chordToPlaceMargin: number = (mouseX - divX - chordMinWidthPixel / 4);
    const chordToPlaceLeftMargin: number = (chordToPlaceMargin / (div.width) * 100); 

    const element = document.createElement("input");
    element.style.width = `1.5ch`;
    element.style.height = height ? "100%" : `50%`;
    element.style.position = "absolute";
    element.style.background = "transparent";
    element.style.marginLeft = +wordIndex === -1 ? `${chordToPlaceMargin}px` :`${chordToPlaceLeftMargin}%`;
    element.style.zIndex = "10";
    element.style.border = "none";
    element.style.color = "orange";
    element.style.fontFamily = "monospace";
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
  
    element.addEventListener('click', (e) => {
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

    const newWidthValue = `${1 + newChord.join("").length }ch`;
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
        <div className="song-action">
          <div className={styles["changeColumn"]}
            style={{
              position: "absolute",
              margin: ".5rem 0 0 1rem",
              display: "flex",
              flexDirection: "row",
              gap: "1rem"
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
              }}/>
              <MdOutlineTextDecrease onClick={() =>{
                setFontSize(fontSize - 1);
              }}/>
              <Link href={`/song/${songId}`}>
                <FaPen/>
              </Link>              
            </div>
          </div>
          <div className={styles["tune"]}>          
            <button onClick={()=>changeTune("-")}>-</button>
            <button onClick={()=>changeTune("+")}>+</button>
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
              {block.map((lyric, j) => {     
                return (
                  <div key={`block-${i}-row-${j}`} id={`block-${i}-row-${j}`} className={styles["lyric-container"]}>
                    {lyric.text === "" ?
                      j !== 0 ? (
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
                              handleDeleteChord(chord.id);
                            }}
                            value={chord.chord}
                          />
                        ))}
                      </div>
                      ) : (
                        <div
                          className="counter"
                          style={{
                            position: "absolute",                              
                          }}
                        >
                          {isOneColumn ? "" : i + 1}
                        </div>
                      )
                    : (
                      <div
                        className={styles["lyric-row"]}
                        id={`block-${i}-row-${j}-extended`}
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0 0.5rem",
                          height: `calc{2 * ${fontSize})px`,
                          fontFamily: "monospace",
                          position: "relative",
                        }}
                      >
                        {j === 0 && (
                          <div
                            className="counter"
                            style={{
                              position: "absolute",                              
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
                              id={`block-${i}-row-${j}-word-${wordIndex}`}
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
                                  width: "100%",
                                  display: "block",
                                  position: "relative",
                                }}
                                id={`span-${i}-${j}`}
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
                                      handleDeleteChord(chord.id);
                                    }}
                                    value={chord.chord}
                                  />
                                ))}
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
                        <div
                          key={`block-${i}-row-${j}-extra`}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            position: "relative",
                            gap: "1rem",
                            minWidth: "2ch", 
                            flexGrow: 1,
                        }}
                          onClick={(e) =>{
                          handleClick(
                              e,
                              lyric.id,
                              i,
                              j,
                              lyric.text.split(" ").length
                            )
                          }
                        }
                        >
                        <span
                          style={{
                            height: `${fontSize}px`,                            
                            width: "100%",
                            display: "block",
                            position: "relative",
                          }}
                        >
                          {lyric.chords
                            .filter(
                              (c: any) => c.position === lyric.text.split(" ").length
                            )
                            .map((chord: any, chordIndex: any) => (
                              <input
                                key={`chord-extra-${chordIndex}`}
                                style={{
                                  width: chord.width || "auto",
                                  left: `${chord.offset * 100}%`,
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
                                  handleDeleteChord(chord.id);
                                }}
                                value={chord.chord}
                              />
                            ))}
                        </span>
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            fontFamily: "monospace",
                            visibility: "hidden", 
                          }}
                        />                        
                      </div>
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