import React from 'react'

const ChordDiagram = ({ chordName } : {chordName : string}) => {
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
    y1: 0,
    y2: 100
  }));

  const horizontalLines = Array(numHorizontalLines).fill({}).map((obj, i) => ({
    y1 : (i+1)*squareWidth + lineWidth*i,
    y2: (i+1)*squareWidth + lineWidth*i,
    x1: 0,
    x2: 100
  }));

  const circles = [
    {
      xIndex: 1,
      yIndex: 2,
      r: circleRadius
    },
    {
      xIndex: 2,
      yIndex: 1,
      r: circleRadius
    },
    {
      xIndex: 4,
      yIndex: 0,
      r: circleRadius
    },
  ];

  console.log(chordName);
  return (
    <svg width={250} height={250} viewBox="0 0 100 100">
        <polygon points="0,0 0,100 100,100, 100,0" fill={"white"}></polygon>
        
        {verticalLines.map((square, i) => (
          <line x1={square.x1} y1={square.y1} x2={square.x2} y2={square.y2} stroke='black' strokeWidth={lineWidth} key={`vertical-${i}`}/>
        ))}

        {horizontalLines.map((square, i) => (
          <line x1={square.x1} y1={square.y1} x2={square.x2} y2={square.y2} stroke='black' strokeWidth={lineWidth} key={`horizonal-${i}`}/>
        ))}

        {circles.map((circle, i) => {
          const cx = circle.xIndex*squareWidth + circle.xIndex * lineWidth + squareWidth / 2 - lineWidth / 2;
          const cy = circle.yIndex*squareHeight + circle.yIndex * lineWidth + squareHeight / 2 - lineWidth / 2;

          return (
            <circle
              cx={cx}
              cy={cy}
              r={circle.r}
              key={`circle-${i}`}
              fill="red"
            />
          );
        })}
    </svg>
  )
}

export default ChordDiagram