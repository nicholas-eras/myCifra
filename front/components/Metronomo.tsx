import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/metronomo.module.css';

const Metronomo = ({ defaultBpm } : {defaultBpm : number}) => {  
  const [inputBpm, setInputBpm] = useState(defaultBpm);
  const [bpm, setBpm] = useState<number>(defaultBpm);
  const [timeHitOtherSide, setTimeHitOtherSide] = useState(60 / bpm);

  const circle = useRef<HTMLDivElement>(null);
  const pulse = useRef<HTMLDivElement>(null);

  const handleAnimation = (circle: HTMLDivElement) => {
    circle.style.animation = `start ${2 * timeHitOtherSide}s infinite linear`;
  };

  const handlePulse = (circle: HTMLDivElement) => {
    circle.style.animation = `pulse ${2*timeHitOtherSide}s infinite steps(1, end)`;
  };

  useEffect(() => {
    setTimeHitOtherSide(60 / bpm);
  }, [bpm]);

  useEffect(() => {
    if (circle.current) handleAnimation(circle.current);
    if (pulse.current) handlePulse(pulse.current);
  }, [timeHitOtherSide]);

  return (
    <div className={styles.container}>
      <div className={styles.controllers}>
        <input
          type="number"
          placeholder="BPM"
          value={inputBpm}
          onChange={(e) => setInputBpm(+e.target.value)}
        />
        <button onClick={() => setBpm(inputBpm)}>BPM</button>
      </div>
      <div className={styles.movingArea}>
        <div className={styles.circle} ref={circle} />
      </div>
      <div className={styles.pulseArea}>
        <div className={styles.circle} ref={pulse} />
      </div>
    </div>
  );
};

export default Metronomo;
