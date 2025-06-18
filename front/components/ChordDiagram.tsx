import React from 'react'

const ChordDiagram = ({ chordName }) => {
  return (
    <svg width={250} height={250} viewBox="0 0 100 100">
        <polygon points="0,0 0,100 100,100, 100,0" fill={"white"}></polygon>
        <line x1={15} y1={0} x2={15} y2={100} stroke='black' strokeWidth={2}></line>
        <line x1={30 + 2} y1={0} x2={30 + 2} y2={100} stroke='black' strokeWidth={2}></line>
        <line x1={45 + 4} y1={0} x2={45 + 4} y2={100} stroke='black' strokeWidth={2}></line>
        <line x1={60 + 6} y1={0} x2={60 + 6} y2={100} stroke='black' strokeWidth={2}></line>
        <line x1={75 + 8} y1={0} x2={75 + 8} y2={100} stroke='black' strokeWidth={2}></line>

        <line y1={15} x1={0} y2={15} x2={100} stroke='black' strokeWidth={2}></line>
        <line y1={30 + 2} x1={0} y2={30 + 2} x2={100} stroke='black' strokeWidth={2}></line>
        <line y1={45 + 4} x1={0} y2={45 + 4} x2={100} stroke='black' strokeWidth={2}></line>
        <line y1={60 + 6} x1={0} y2={60 + 6} x2={100} stroke='black' strokeWidth={2}></line>
        <line y1={75 + 8} x1={0} y2={75 + 8} x2={100} stroke='black' strokeWidth={2}></line>

        <circle cx={30 + 2} cy={45 - 15/3} r={5}></circle>
    </svg>
  )
}

export default ChordDiagram