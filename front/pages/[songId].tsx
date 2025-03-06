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
  const fontSizeRelativeDiv = 80;
  const numRowsPerColumn = 20;

  useEffect(() => {    
    if (songId) {
      fetchSongData(+songId);
    }
  }, [songId]);

  const fetchSongData = async(id: number) =>  {      
      const data = await songService.getSongById(id);
      setSong(data);                     
  }

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
  ) => {
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
  
      element.remove();
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
        lyrics: prevSong.lyrics.map((lyric: any) => ({
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
      const updatedSong = await songService.updateSong(song.id, payload);  
      setSong(updatedSong);
      alert('Música atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar música:', error);
      alert('Erro ao atualizar música');
    }
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
        <div className={styles["lyric"]}>
        {lyricBlocks.map((block, i) => (
          <div className={styles["lyric-block"]} key={`block-${i}`}>
            {block.map((lyric, j) => {     
              return (
                <div key={`block-${i}-row-${j}`}>
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
                    <div className="lyric-row" key={`block-${i}-row-${j}-nonblank`}>
                      {j === 0 ? `${i + 1})` : `\u00A0 \u00A0`} {lyric.text}
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