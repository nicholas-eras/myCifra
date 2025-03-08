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

  // let myObserver:any;
  // if (typeof window !== "undefined"){
  //    myObserver = new ResizeObserver(entries => {    
  //     entries.forEach(entry => {
  //       const lyricChordsDiv = entry.contentRect;
  //       const lyricDiv = document.querySelector(`#${entry.target.id}-nonblank`);
  //       const chordsDiv = document.querySelector(`#${entry.target.id}-blank`);
  //       const lyricChordsDivWidth = lyricChordsDiv.width;
  //       const lyricDivWidth = lyricDiv?.getBoundingClientRect().width;          

  //       if (!lyricDivWidth){ return }
  //       if (lyricChordsDivWidth < lyricDivWidth){
  //         const lyric = lyricDiv.textContent;
  //         if (!lyric){ return }
  //         const lyricArray = lyric.split(" ");
  //         const lyricFirst = lyricArray?.slice(0, Math.floor(lyricArray.length / 2)).join(" ");
  //         const lyricSecond = lyricArray?.slice(Math.floor(lyricArray.length / 2)).join(" ");
  //         const lyricFirstChords: any = [];
  //         const lyricSecondChords: any = [];
  //         if (chordsDiv){ 
  //           Array.from(chordsDiv.children).forEach(child => {
  //             const chordMarginLeftValue = +(child as HTMLElement).style.marginLeft.split("%")[0];
  //             if (chordMarginLeftValue > 50){
  //               (child as HTMLElement).style.marginLeft = `${chordMarginLeftValue - 50}%`;
  //               lyricSecondChords.push(child);
  //             }
  //             else{
  //               lyricFirstChords.push(child) 
  //             }              
  //           });
  //         }          
  //       }
  //     });
  //   });   
  // }  

  useEffect(() => {    
    if (lyricBlocks.length > 0) {
      lyricBlocks.forEach((block, i) => {
        block.forEach((_, j) => {          
          // const someEl = document.querySelector(`#block-${i}-row-${j}`);
          // if (someEl){            
          //   myObserver.observe(someEl);
          // }
          adjustChordsDivWidth(`block-${i}-row-${j}-nonblank`, `block-${i}-row-${j}-blank`);
        });
      });
    }    
  }, [lyricBlocks]);

  const adjustChordsDivWidth = (lyricDivId: string, chordsDivId: string) => {
    const lyricDiv = document.getElementById(lyricDivId);
    const chordsDiv = document.getElementById(chordsDivId);
    if (lyricDiv && chordsDiv) {      
      chordsDiv.style.width = `${lyricDiv.getBoundingClientRect().width}px`            
    }
  };   
  
  if (!song) {
    return <div>Loading...</div>;
  }

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>,
    lyricId: number,
    blockId: number,
    rowId: number,
  ) => {
    const lyricElement = document.getElementById(`block-${blockId}-row-${rowId}-nonblank`);
    (e.currentTarget as HTMLElement).style.width = "100%";
    if (lyricElement){
      (e.currentTarget as HTMLElement).style.width = `${lyricElement.getBoundingClientRect().width}px`;
    }

    const mouseX: number = e.clientX;
    const div = e.currentTarget.getBoundingClientRect();    
    const divX: number = div.left;

    const chordMinWidthRelative = 0.035;
    const chordMinWidthPixel = chordMinWidthRelative * div.width;
    
    const chordToPlaceMargin: number = (mouseX - divX - chordMinWidthPixel / 2);
    const chordToPlaceLeftMargin: number = (chordToPlaceMargin / (div.width) * 100);

    const element = document.createElement("input");
    element.style.width = `${chordMinWidthPixel}px`;
    element.style.height = `100%`;
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
  
    element.addEventListener('mouseover', () => {
      element.style.cursor = 'pointer';
    });
  
    element.addEventListener('mouseout', () => {
      element.style.cursor = 'default';
    });
  
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
        marginLeft: element.style.marginLeft,
      };
  
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
  
      if (element.parentElement) {
        element.remove();
      }   
    });
  
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteChord(chordTempId);
      if (element.parentElement) {
        element.remove();
      }      
    });
  
    const adjustWidth = () => {
      element.style.width = `${Math.max(element.scrollWidth, chordMinWidthPixel) + 4}px`;
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
      await songService.updateSong(song.id, payload);  
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
    const newWidthValue = `${widthValue + chordCharSize*(newChord.join("").length - chord.length)}px`;
    
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
                  <div key={`block-${i}-row-${j}`} id={`block-${i}-row-${j}`}>
                    {lyric.text === "" ? (
                      <div
                      className={styles["lyric-row"]}
                      key={`block-${i}-row-${j}-blank`}
                      onClick={(e) => handleClick(e, lyric.id, i, j)}
                      style={{
                        fontSize: `${fontSizeRelativeDiv}%`,
                        position: "relative",
                      }}
                    >
                      &nbsp;
                      {lyric.chords.map((chord: any, k: number) => (
                        <input
                          key={`block-${i}-row-${j}-chord-${k}`}
                          style={{
                            width: chord.width,
                            position: "absolute",
                            verticalAlign: "bottom",
                            height: "100%",
                            background: "transparent",
                            marginLeft: chord.marginLeft,
                            zIndex: "10",
                            border: "none",
                            color: "orange",
                            fontWeight: "bold",
                            fontSize: `${fontSizeRelativeDiv}%`,
                          }}
                          readOnly
                          onMouseOver={(e) => (e.currentTarget.style.cursor = "pointer")}
                          onMouseOut={(e) => (e.currentTarget.style.cursor = "default")}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChord(chord.id);                          
                          }}
                          value={chord.chord}
                        />
                      ))}
                    </div>
                    ) : (
                      <>
                      <div
                        className={styles["lyric-row"]}
                        key={`block-${i}-row-${j}-blank`}
                        id={`block-${i}-row-${j}-blank`}
                        onClick={(e) => handleClick(e, lyric.id, i, j)}
                        style={{
                          fontSize: `${fontSizeRelativeDiv}%`,
                          position: "relative",
                        }}
                      >
                        &nbsp;
                        {lyric.chords.map((chord: any, k: number) => (
                          <input
                            key={`block-${i}-row-${j}-chord-${k}`}
                            style={{
                              width: chord.width,
                              position: "absolute",
                              verticalAlign: "bottom",
                              height: "100%",
                              background: "transparent",
                              marginLeft: chord.marginLeft,
                              zIndex: "10",
                              border: "none",
                              color: "orange",
                              fontWeight: "bold",
                              fontSize: `${fontSizeRelativeDiv}%`,
                            }}
                            readOnly
                            onMouseOver={(e) => (e.currentTarget.style.cursor = "pointer")}
                            onMouseOut={(e) => (e.currentTarget.style.cursor = "default")}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChord(chord.id);                          
                            }}
                            value={chord.chord}
                          />
                        ))}
                      </div>                    
                      <div
                        className="lyric-row"
                        key={`block-${i}-row-${j}-nonblank`}
                        style={{
                          display:"inline-block",
                          whiteSpace:"nowrap",
                          paddingRight:"0.5rem",
                          marginLeft:"1rem",
                        }}
                        id={`block-${i}-row-${j}-nonblank`}
                      >
                        {j === 0 ? (
                          <div className="counter" style={{
                            position:"absolute",
                            marginLeft:"-1rem"
                          }}>
                            {i + 1}
                          </div>
                          )
                          : ``} {lyric.text}
                      </div>
                    </>
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