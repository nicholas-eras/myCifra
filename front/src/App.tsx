
import './App.css'
import music from "./assets/example.json";

function App() {
  const musicName: string = "Eu e minha casa";
  const artist: string = "André Valadão";
 
  const lyricArray:string[] = music.lyrics
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter((row) => row !== "");    
  const numRowsPerColumn:number = 20;
  const numberOfColumns: number = Math.ceil(lyricArray.length / numRowsPerColumn);
  const lyricBlocks: string[][] = Array.from({ length: numberOfColumns }, () => []);

  lyricArray.forEach((row, i) => {
    const rowIndex:number = Math.floor(i / numRowsPerColumn);
    lyricBlocks[rowIndex].push(row);
  });

  interface ChordMap {
    [key: string]: any[] | undefined;
  }
  const chords: ChordMap[] = music.chords;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, chordsRow:any) => {
    const mouseX: number = e.clientX;
    const div = e.currentTarget.getBoundingClientRect();
    const divX: number = div.left;

    const chordMinWidthRelative = 0.03;
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
      const key = Object.keys(chordsRow)[0];
      chordsRow[key] = [...chordsRow[key], { 
        width: `${Math.floor(chordMinWidthPixel)}px`,
        position: "absolute",
        background: "transparent",
        marginLeft: `${(((mouseX-divX - chordMinWidthPixel/2))/ (div.width) * 100)}%`,
        zIndex: "10",
        border: "none",
        color: "orange",
        fontWeight: "bold",
        fontSize: "1rem",
        chord: element.value
      }];
      console.log(chords);
    });

    element.addEventListener('click', () => {
      element.remove();
    });
    
    const adjustWidth = () => {
      element.style.width = `${Math.max(element.scrollWidth, chordMinWidthPixel)}px`;
    };
  
    element.addEventListener('input', adjustWidth);
  
    e.currentTarget.appendChild(element);
    element.focus();
  }

  return (
    <>
      <div className="cifra-container">
        <div className="music-info">
          <div>{musicName}</div>
          <div>{artist}</div>
        </div>
        <div className="lyric">
          {lyricBlocks.map((block, i) => (
            <div className="lyric-block" key={`block-${i}`}>
              {block.map((row, j) => (
                <div key={`block-${i}-row-${j}`}>
                  <div
                    className="lyric-row"
                    key={`block-${i}-row-${j}-blank`}
                    onClick={(e) => handleClick(e, chords[j + i * numRowsPerColumn])}
                    style={{
                      fontSize: "1rem",
                      position: "relative",
                      border: "1px solid black"
                    }}
                  >
                    &nbsp;
                    {Object.values(chords[j + i * numRowsPerColumn])[0]?.map((row: any, k: number) => (
                      <input
                        key={`block-${i}-row-${j}-chord-${k}`}
                        style={{
                          width: row.width,
                          position: row.position,
                          background: row.background,
                          marginLeft: row.marginLeft,
                          zIndex: row.zIndex,
                          border: row.border,
                          color: row.color,
                          fontWeight: row.fontWeight,
                          fontSize: row.fontSize,
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.cursor = "pointer")}
                        onMouseOut={(e) => (e.currentTarget.style.cursor = "default")}
                        onClick={(e) => e.currentTarget.remove()}
                        defaultValue={row.chord}
                      />
                    ))}
                  </div>
                  <div className="lyric-row" key={`block-${i}-row-${j}-nonblank`}>
                    {j === 0 ? `${i + 1})` : `\u00A0 \u00A0`} {row}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
  
}

export default App
