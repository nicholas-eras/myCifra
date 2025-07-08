import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import  Metronomo  from '../../components/Metronomo';

const MetronomoTeste = () => {
  const router = useRouter();
    
  const { bpm } = router.query;

  if (!bpm || typeof bpm !== 'string') return <p>Carregando...</p>;

  const defaultBpm = +bpm || 120;

  return (
    <Metronomo defaultBpm={defaultBpm}/>
  );
};

export default MetronomoTeste;
