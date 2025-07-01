import React, { useState } from 'react'
import { findGuitarChord } from "chord-fingering";

const converter_acordes = (texto: string) => {
  return texto.replace(/([A-G][#b]?)(7M)/g, '$1maj7').replaceAll("º", "°");
}

const ChordDiagram = ({ chordName } : {chordName : string}) => {
  const result = findGuitarChord(converter_acordes(chordName));
  if (!result){
    return <></>
  }
  console.log(result);
  const [chordIndex, setChordIndex] = useState<number>(0);

  const swapChord = (increment: number) => {
    const total = result.fingerings.length;
    const newIndex = (chordIndex + increment + total) % total;
    setChordIndex(newIndex);
  };

  const positions = result.fingerings[chordIndex].positions;
  const maxFret = Math.max(...positions.map((fing) => fing.fret));
  let minFret = 1;
  for (let i = 0; i <= 5; i++) {
    const stringFingering = positions.find(p => p.stringIndex === i);
    if (stringFingering && stringFingering.fret > 0) {
      minFret = stringFingering.fret;
      break;
    }
  }

  let barre = null;
  if (result.fingerings[chordIndex].barre){
    barre = {
      start: Math.min(...result.fingerings[chordIndex].barre.stringIndices),
      end: Math.max(...result.fingerings[chordIndex].barre.stringIndices),
      fret: result.fingerings[chordIndex].barre.fret,
      strings: result.fingerings[chordIndex].barre.stringIndices
    }
  }
  console.log(barre);
  let valueToSubtract = 0;
  const diagramFingering = positions.map((fing) => {
    let fret = fing.fret;
    if (maxFret > 6 && minFret >= 6){
      if (fret > 6){
        fret -= 6;
        valueToSubtract = 6;
      }
    }
    else if (maxFret > 6 && minFret >= 3){      
        fret -= 3;
        valueToSubtract = 3;
    }
    return {
      xIndex: fing.stringIndex,
      yIndex: fret,
      fretNotation: maxFret,
      barre: barre?.strings.includes(fing.stringIndex) ?? false
    }
  });

  const svgSize = 100;
  const maxWidthRel = 110;
  const maxHeightRel = 110;
  const numVerticalLines = 6;
  const numHorizontalLines = 6;
  const numVerticalSquares = numVerticalLines + 1;
  const numHorizontalSquares = numHorizontalLines + 1;
  const lineWidth = 2;
  const squareWidth = (maxWidthRel - numHorizontalLines*lineWidth) / numHorizontalSquares;
  const squareHeight = (maxHeightRel - numVerticalLines*lineWidth) / numVerticalSquares;
  const circleRadius = 5;
  const verticalLines = Array(numVerticalLines).fill({}).map((obj, i) => ({
    x1 : (i+1)*squareHeight,
    x2: (i+1)*squareHeight,
    y1: squareHeight,
    y2: 100
  }));
  
  const horizontalLines = Array(numHorizontalLines).fill({}).map((obj, i) => ({
    y1 : (i+1)*squareHeight,
    y2: (i+1)*squareHeight,
    x1: squareWidth,
    x2: 100 - squareWidth - lineWidth
  }));
  
  return (
    <div>
      <svg 
        width={ squareWidth / 100 * svgSize} 
        height={svgSize} 
        viewBox={`0 0 ${squareWidth} 100`} 
        preserveAspectRatio="xMidYMid meet"
      >
        <polygon points={`0,0 0,100 ${squareWidth},100 ${squareWidth},0`} fill="white" />
        <text
          x={squareWidth / 2}
          y={ 
            minFret > valueToSubtract ? 
            ((minFret - valueToSubtract +1)*squareHeight - squareHeight / 4)
            :
            ((minFret+1)*squareHeight - squareHeight / 4)
          }
          fontSize={squareHeight}  
          fill='black'
          textAnchor='middle'
        >
          {minFret !== 0 && minFret}
        </text>
      </svg>

      <svg width={1.25*svgSize} height={svgSize} viewBox="0 0 100 100">
          <polygon points="-5,0 -5,105 105,105, 105,0" fill={"white"}></polygon>
          
          {verticalLines.map((square, i) => (
            <line x1={square.x1} y1={square.y1} x2={square.x2} y2={square.y2} stroke='black' strokeWidth={lineWidth/2} key={`vertical-${i}`}/>
          ))}

          {horizontalLines.map((square, i) => {
              if (i === 0 ){
                return <line x1={square.x1} y1={square.y1} x2={square.x2} y2={square.y2} stroke='black' strokeWidth={valueToSubtract > 0 ? 0 : lineWidth / 2} key={`horizonal-${i}`}/>
              }
              else{
                return <line x1={square.x1} y1={square.y1} x2={square.x2} y2={square.y2} stroke='black' strokeWidth={i === 0 ? 1 : lineWidth} key={`horizonal-${i}`}/>
              }
            }                        
          )}
          
          {diagramFingering.map((circle, i) => {
            if (circle.barre){
              return 
            }

            if (circle.yIndex < 0){
              circle.yIndex = 0;
            }   
            const cx = (circle.xIndex+1)*squareWidth ;
            const cy = circle.yIndex > 0 ? (circle.yIndex)*squareHeight + squareHeight / 2 : squareHeight / 2;
            return (              
              <circle
                cx={cx}
                cy={cy}
                r={circleRadius}
                key={`circle-${i}`}
                fill={circle.yIndex === 0 ? "none" : "red"}
                stroke="black"
                strokeWidth={1}
              />              
            );
          })}

          { barre && 
            <rect 
              width={barre.start === 0 ? (barre.end - barre.start)*squareWidth : (barre.end - barre.start + 1)*squareWidth}
              height={squareHeight}
              x={ barre.start === 0 ? (barre.start + 1)*squareWidth : (barre.start)*squareWidth}
              y={(barre.fret)*squareHeight}
              rx={10}
              ry={10}
              fill='red'
              stroke='black'
            />
          }
      </svg>
      <div className="button-row" style={{display: "flex", flexDirection: "row"}}>
        <div
          className="first-svg-space"
          style={{
            width: `${squareWidth / 100 * svgSize}px`,
            height: `${squareHeight}px`
          }}>
        </div>
        <div
          className="swap-fingering"
          style={{
            width: `${svgSize}px`,
            display: "flex",
            flexDirection:"row",
            alignItems: "center",
            justifyContent: "center"
          }}>
          <button onClick={()=>swapChord(-1)}>{"<"}</button>
          <button onClick={()=>swapChord(1)}>{">"}</button>
        </div>
      </div>
    </div>
  )
}

export default ChordDiagram