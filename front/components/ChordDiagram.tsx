import React, { useState } from 'react'
import { findGuitarChord } from "chord-fingering";


const ChordDiagram = ({ chordName } : {chordName : string}) => {
  const result = findGuitarChord(chordName);
  const [chordIndex, setChordIndex] = useState<number>(0);

  const swapChord = (increment: number) => {
    const total = result.fingerings.length;
    const newIndex = (chordIndex + increment + total) % total;
    setChordIndex(newIndex);
  };

  const positions = result.fingerings[chordIndex].positions;
  const maxFret = Math.max(...positions.map((fing) => fing.fret));
  let minFret = 0;
  for (let i = 0; i <= 5; i++) {
    const stringFingering = positions.find(p => p.stringIndex === i);
    if (stringFingering && stringFingering.fret > 0) {
      minFret = stringFingering.fret;
      break;
    }
  }

  const diagramFingering = positions.map((fing) => {
    let fret = fing.fret;
    if (maxFret > 6){
      if (fret > 6){
        fret -= 6;
      }
    }
    return {
      xIndex: fing.stringIndex,
      yIndex: fret,
      fretNotation: maxFret
    }
  });
  console.log(positions);
  console.log(diagramFingering);
  const svgSize = 250;
  const maxWidthRel = 100;
  const maxHeightRel = 100;
  const numVerticalLines = 5;
  const numHorizontalLines = 5;
  const numVerticalSquares = numVerticalLines + 1;
  const numHorizontalSquares = numHorizontalLines + 1;
  const lineWidth = 2;
  const squareWidth = (maxWidthRel - numHorizontalLines*lineWidth) / numHorizontalSquares;
  const squareHeight = (maxHeightRel - numVerticalLines*lineWidth) / numVerticalSquares;
  const circleRadius = 5;
  const verticalLines = Array(numVerticalLines).fill({}).map((obj, i) => ({
    x1 : (i+1)*squareHeight + lineWidth*i,
    x2: (i+1)*squareHeight + lineWidth*i,
    y1: squareHeight,
    y2: 100
  }));

  const horizontalLines = Array(numHorizontalLines).fill({}).map((obj, i) => ({
    y1 : (i+1)*squareWidth + lineWidth*i,
    y2: (i+1)*squareWidth + lineWidth*i,
    x1: 0,
    x2: 100
  }));
  
  return (
    <div>
      <svg 
        width={ squareWidth / 100 * svgSize} 
        height={svgSize} 
        viewBox={`0 0 ${squareWidth} 100`} 
        preserveAspectRatio="xMidYMid meet"
      >
        <polygon points={`0,0 0,100 ${squareWidth},100 ${squareWidth},0`} fill="gray" />
        <text
          x={squareWidth / 2}
          y={
            minFret > 6 ? 
            ((minFret - 6 + 1) * (squareHeight))
            :
            ((minFret + 1) * (squareHeight))
          }
          fontSize={squareHeight}          
          fill='black'
          textAnchor='middle'
        >
          {minFret !== 0 && minFret}
        </text>
      </svg>

      <svg width={svgSize} height={svgSize} viewBox="0 0 100 100">
          <polygon points="0,0 0,100 100,100, 100,0" fill={"white"}></polygon>
          
          {verticalLines.map((square, i) => (
            <line x1={square.x1} y1={square.y1} x2={square.x2} y2={square.y2} stroke='black' strokeWidth={lineWidth/2} key={`vertical-${i}`}/>
          ))}

          {horizontalLines.map((square, i) => {
            if (i === 0 ){
              return <line x1={square.x1} y1={square.y1} x2={square.x2} y2={square.y2} stroke='black' strokeWidth={maxFret > 6 ? lineWidth : lineWidth / 2} key={`horizonal-${i}`}/>
            }
            else{
              return <line x1={square.x1} y1={square.y1} x2={square.x2} y2={square.y2} stroke='black' strokeWidth={i === 0 ? 1 : lineWidth} key={`horizonal-${i}`}/>
            }
          }                        
          )}

          {diagramFingering.map((circle, i) => {
            if (circle.yIndex < 0){
              circle.yIndex = 0;
            }
            const cx = circle.xIndex*squareWidth + circle.xIndex * lineWidth + squareWidth / 2 - lineWidth / 2;
            const cy = circle.yIndex*squareHeight + circle.yIndex * lineWidth + squareHeight / 2 - lineWidth / 2;
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