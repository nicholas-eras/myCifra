import { useEffect, useState } from 'react';
import styles from '../styles/app.module.css';
import { useRouter } from "next/router";
import musicService from '../service/app.service';
import Link from 'next/link';

function Music() {
  const router = useRouter();
  const { musicId } = router.query;
  const [music, setMusic] = useState<any | null>(null);
  const [lyricBlocks, setLyricBlocks] = useState<any[][]>([]);
  const numRowsPerColumn = 20;

  useEffect(() => {    
    if (musicId) {
      fetchMusicData(+musicId);
    }
  }, [musicId]);

  const fetchMusicData = async(id: number) =>  {      
      const data = await musicService.getMusicById(id);
      setMusic(data);                     
  }

  useEffect(() => {
    if (!music || !music.lyrics) {return}

    const numberOfColumns = Math.ceil(music.lyrics.length / numRowsPerColumn);
    const initialChordBlocks: any[][] = Array.from({ length: numberOfColumns }, () => []);        

    music.lyrics.forEach((lyrics: { lineIndex: number; chords: any; }) => {
      const rowIndex = Math.floor(lyrics.lineIndex / numRowsPerColumn);
      initialChordBlocks[rowIndex].push(lyrics);
    });
    setLyricBlocks(initialChordBlocks);
  }, [music]);
  
  if (!music) {
    return <div>Loading...</div>;
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, lyricId: number) => {
    const mouseX: number = e.clientX;
    const div = e.currentTarget.getBoundingClientRect();
    const divX: number = div.left;

    const chordMinWidthRelative = 0.05;
    const chordMinWidthPixel = chordMinWidthRelative * div.width;
    const chordToPlaceMargin: number = (mouseX-divX - chordMinWidthPixel/2);
    const chordToPlaceLeftMargin: number = (chordToPlaceMargin / (div.width) * 100);

    const element = document.createElement("input");
    element.style.width = `${chordMinWidthPixel}px`;
    element.style.position = "absolute";
    element.style.background = "transparent";
    element.style.marginLeft = `${chordToPlaceLeftMargin}%`;
    element.style.zIndex = "10";
    element.style.border = "none";
    element.style.color = "orange";
    element.style.fontWeight = "bold";
    element.style.fontSize = "1rem";
    const chordTempId = Date.now();

    element.addEventListener('mouseover', () => {
      element.style.cursor = 'pointer';
    });
    
    element.addEventListener('mouseout', () => {
      element.style.cursor = 'default';
    });

    element.addEventListener('focusout', () => {
      if (element.value.trim() == ""){
        return;
      }

      const newChord: any = {
        id: chordTempId,
        lyricId :lyricId,
        chord: element.value,
        width: `${Math.floor(chordMinWidthPixel)}px`,
        marginLeft: `${chordToPlaceLeftMargin}%`
      };

      setMusic((prevMusic: any) => {
        const musicCopy = prevMusic;        
        const newMusic = musicCopy;
        newMusic.lyrics.forEach((lyric: { id: number; chords: any[]; })=>{
          if (lyric.id == lyricId){
            lyric.chords.push(newChord);
          }
        });
        return newMusic;
      });
    });

    element.addEventListener('click', () => {
      handleDeleteChord(chordTempId);
      element.remove();
    });
    
    const adjustWidth = () => {
      element.style.width = `${Math.max(element.scrollWidth, chordMinWidthPixel)}px`;
    };
  
    element.addEventListener('input', adjustWidth);
  
    e.currentTarget.appendChild(element);
    element.focus();
  }

  const handleDeleteChord = (chordId:number) => {
    setMusic((prevMusic: any) => {
      const newMusic = {
        ...prevMusic,
        lyrics:
          prevMusic.lyrics.map((lyric:any) => {
              return {
                ...lyric,
                chords: lyric.chords.filter((chord: any) => chord.id != chordId)
              }   
           })
        }           
      return newMusic;
    });    
  }

  const handleUpdateMusic = async () => {
    if (!music) return;
    const payload = {
      name: music.name,
      artist: music.artist,
      lyrics: lyricBlocks.flat()
    };

    try {
      const updatedMusic = await musicService.updateMusic(music.id, payload);  
      setMusic(updatedMusic);            
      alert('Música atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar música:', error);
      alert('Erro ao atualizar música');
    }
  };              

  return (
    <>
      <div className={styles["cifra-container"]}>
        <div className={styles["music-info"]}>
          <div>{music.name}</div>
          <div>{music.artist}</div>
          <Link href="/">
            <button style={{
                margin: '0 auto',
                padding: '5px 10px',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width:"20%",
                right:"calc(5%)",
                position:"absolute"
              }}>
              Voltar
            </button>
          </Link>
          <button 
            onClick={handleUpdateMusic}
            style={{
              margin: '0 auto',
              padding: '5px 10px',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width:"20%"
            }}
          >
            Atualizar Música
          </button>     
        </div>
        <div className={styles["lyric"]}>
        {lyricBlocks.map((block, i) => (
          <div className={styles["lyric-block"]} key={`block-${i}`}>
            {block.map((lyric, j) => {     
              return (
                <div key={`block-${i}-row-${j}`}>
                  <div
                    className={styles["lyric-row"]}
                    key={`block-${i}-row-${j}-blank`}
                    onClick={(e) => handleClick(e, lyric.id)}
                    style={{
                      fontSize: "1rem",
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
                          background: "transparent",
                          marginLeft: chord.marginLeft,
                          zIndex: "10",
                          border: "none",
                          color: "orange",
                          fontWeight: "bold",
                          fontSize: "1rem",                          
                        }}
                        readOnly
                        onMouseOver={(e) => (e.currentTarget.style.cursor = "pointer")}
                        onMouseOut={(e) => (e.currentTarget.style.cursor = "default")}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChord(chord.id);                          
                        }}
                        defaultValue={chord.chord}
                      />
                    ))}
                  </div>
                  <div className="lyric-row" key={`block-${i}-row-${j}-nonblank`}>
                    {j === 0 ? `${i + 1})` : `\u00A0 \u00A0`} {lyric.text}
                  </div>
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

export default Music