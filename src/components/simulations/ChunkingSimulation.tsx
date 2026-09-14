'use client';

import React, { useState } from 'react';
import { SimulationConfig } from '@/types/lesson';
import { motion } from 'framer-motion';
import { Sparkles, Scissors, CheckCircle2, RotateCcw } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface ChunkingSimulationProps {
  config: SimulationConfig;
  onComplete: () => void;
}

export default function ChunkingSimulation({
  config,
  onComplete,
}: ChunkingSimulationProps) {
  const digits = ['9', '8', '1', '2', '4', '0', '6', '7', '3', '5'];
  // Target slices after index 2 (after '1') and index 5 (after '0') -> [981] [240] [6735]
  const [slices, setSlices] = useState<number[]>([]);
  const [isTested, setIsTested] = useState(false);

  const toggleSlice = (index: number) => {
    soundFx.playPop();
    setIsTested(false);
    if (slices.includes(index)) {
      setSlices(slices.filter((i) => i !== index));
    } else {
      setSlices([...slices, index].sort((a, b) => a - b));
    }
  };

  const isCorrectChunking =
    slices.length === 2 && slices.includes(2) && slices.includes(5);

  const handleTestChunking = () => {
    if (isCorrectChunking) {
      soundFx.playSuccess();
      setIsTested(true);
    } else {
      soundFx.playGentleError();
      setIsTested(true);
    }
  };

  const handleReset = () => {
    soundFx.playPop();
    setSlices([]);
    setIsTested(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-success-light text-success-dark">
          Working Memory Slicer
        </span>
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-2">
          Slice 10 Digits Into 3 Easy Chunks
        </h3>
        <p className="text-sm font-bold text-ink-muted mt-1">
          Tap the dotted scissors between digits to create group boundaries: [981] - [240] - [6735]
        </p>
      </div>

      {/* Digit Slicing Track */}
      <div className="w-full p-6 sm:p-8 bg-gradient-to-r from-bg-blue to-bg-lavender rounded-4xl border-2 border-primary/30 flex items-center justify-center shadow-inner overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          {digits.map((digit, idx) => {
            const hasSliceAfter = slices.includes(idx);

            return (
              <React.Fragment key={idx}>
                {/* Digit Bubble */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="w-10 h-14 sm:w-12 sm:h-16 rounded-2xl bg-white border-2 border-secondary font-heading font-extrabold text-2xl sm:text-3xl text-ink flex items-center justify-center shadow-sm select-none"
                >
                  {digit}
                </motion.div>

                {/* Slicing Divider (between digits) */}
                {idx < digits.length - 1 && (
                  <button
                    type="button"
                    onClick={() => toggleSlice(idx)}
                    aria-label={`Toggle slice after digit ${digit}`}
                    className={`w-5 sm:w-7 h-14 rounded-xl flex items-center justify-center transition-all ${
                      hasSliceAfter
                        ? 'bg-accent text-ink scale-110 shadow-float border border-white'
                        : 'text-ink-muted/40 hover:text-primary hover:bg-white/60 border border-dashed border-secondary-light'
                    }`}
                  >
                    <Scissors className={`w-3.5 h-3.5 ${hasSliceAfter ? 'rotate-90' : ''}`} />
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Preview Chunks Display */}
      <div className="w-full mt-6 p-4 rounded-3xl bg-bg-lavender/60 border border-secondary-light/60 flex items-center justify-center gap-3">
        <span className="text-xs font-bold text-ink-muted uppercase">
          Your Chunks:
        </span>
        {slices.length === 0 ? (
          <span className="font-bold text-sm text-ink-muted">
            [ 9812406735 ] (1 huge chunk of 10 digits)
          </span>
        ) : (
          <div className="flex items-center gap-2 font-heading font-extrabold text-lg text-primary-dark">
            <span>[ {digits.slice(0, (slices[0] ?? 0) + 1).join('')} ]</span>
            {slices[1] !== undefined && (
              <span>[ {digits.slice(slices[0] + 1, slices[1] + 1).join('')} ]</span>
            )}
            <span>[ {digits.slice((slices[slices.length - 1] ?? 0) + 1).join('')} ]</span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="w-full max-w-md flex items-center justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={handleReset}
          className="px-5 py-3 rounded-full border border-secondary-light font-bold text-ink-muted hover:bg-bg-lavender flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>

        {!isCorrectChunking ? (
          <button
            type="button"
            onClick={handleTestChunking}
            disabled={slices.length === 0}
            className="flex-1 py-4 rounded-full bg-primary text-white font-heading font-extrabold text-lg shadow-float hover:bg-primary-dark disabled:opacity-40 transition-all flex items-center justify-center gap-2 btn-bouncy"
          >
            <Sparkles className="w-5 h-5" /> Test Rhythm
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            className="flex-1 py-4 rounded-full bg-success text-white font-heading font-extrabold text-lg shadow-float hover:bg-success-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
          >
            <CheckCircle2 className="w-5 h-5" /> Perfect 3-Chunk Rhythm! Continue
          </button>
        )}
      </div>
    </div>
  );
}
