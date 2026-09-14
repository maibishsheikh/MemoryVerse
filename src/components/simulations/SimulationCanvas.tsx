'use client';

import React from 'react';
import { SimulationConfig } from '@/types/lesson';
import VedicX11Simulation from './VedicX11Simulation';
import VisualAssociationSimulation from './VisualAssociationSimulation';
import MemoryPalaceSimulation from './MemoryPalaceSimulation';
import ChunkingSimulation from './ChunkingSimulation';
import MnemonicsSimulation from './MnemonicsSimulation';

interface SimulationCanvasProps {
  config: SimulationConfig;
  onComplete: () => void;
}

export default function SimulationCanvas({
  config,
  onComplete,
}: SimulationCanvasProps) {
  switch (config.simulationType) {
    case 'vedic_x11':
      return <VedicX11Simulation config={config} onComplete={onComplete} />;
    case 'visual_association':
      return <VisualAssociationSimulation config={config} onComplete={onComplete} />;
    case 'memory_palace':
      return <MemoryPalaceSimulation config={config} onComplete={onComplete} />;
    case 'chunking':
      return <ChunkingSimulation config={config} onComplete={onComplete} />;
    case 'mnemonics':
      return <MnemonicsSimulation config={config} onComplete={onComplete} />;
    default:
      return (
        <div className="w-full max-w-xl mx-auto p-8 bg-white rounded-4xl border text-center">
          <p className="font-bold text-ink">Unknown simulation type: {config.simulationType}</p>
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-3 rounded-full bg-primary text-white font-bold"
          >
            Continue
          </button>
        </div>
      );
  }
}
