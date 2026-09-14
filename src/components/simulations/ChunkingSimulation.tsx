'use client';

import React, { useState, useCallback } from 'react';
import { SimulationConfig } from '@/types/lesson';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Scissors, CheckCircle2, RotateCcw, Music, Zap } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';
import StarRating from '../ui/StarRating';

interface ChunkingSimulationProps {
  config: SimulationConfig;
  onComplete: () => void;
}

const CHUNK_COLORS = [
  { bg: 'bg-primary/20', border: 'border-primary/40', text: 'text-primary-dark', glow: 'glow-pulse' },
  { bg: 'bg-accent/20', border: 'border-accent/40', text: 'text-accent-dark', glow: 'glow-pulse-accent' },
  { bg: 'bg-success/20', border: 'border-success/40', text: 'text-success-dark', glow: 'glow-pulse-success' },
  { bg: 'bg-secondary/20', border: 'border-secondary/40', text: 'text-secondary-dark', glow: '' },
];

export default function ChunkingSimulation({
  config,
  onComplete,
}: ChunkingSimulationProps) {
  const digits = ['9', '8', '1', '2', '4', '0', '6', '7', '3', '5'];
  const [phase, setPhase] = useState<'slice' | 'rhythm' | 'recall' | 'complete'>('slice');
  const [slices, setSlices] = useState<number[]>([]);
  const [rhythmPulseIndex, setRhythmPulseIndex] = useState<number | null>(null);
  const [recallInput, setRecallInput] = useState<string[]>(['', '', '']);
  const [recallErrors, setRecallErrors] = useState(0);

  // Correct slices: after index 2 and 5 → [981] [240] [6735]
  const isCorrectChunking = slices.length === 2 && slices.includes(2) && slices.includes(5);

  const toggleSlice = useCallback((index: number) => {
    soundFx.playPop();
    if (slices.includes(index)) {
      setSlices(slices.filter((i) => i !== index));
    } else {
      setSlices([...slices, index].sort((a, b) => a - b));
    }
  }, [slices]);

  const handleTestSlice = useCallback(() => {
    if (isCorrectChunking) {
      soundFx.playSuccess();
      // Start rhythm animation
      setPhase('rhythm');
      animateRhythm();
    } else {
      soundFx.playGentleError();
    }
  }, [isCorrectChunking]);

  const animateRhythm = () => {
    // Pulse each chunk group in sequence
    const chunks = getChunks();
    let delay = 0;
    chunks.forEach((_, chunkIdx) => {
      setTimeout(() => {
        setRhythmPulseIndex(chunkIdx);
      }, delay);
      delay += 800;
    });
    setTimeout(() => {
      setRhythmPulseIndex(null);
    }, delay);
  };

  const handleStartRecall = useCallback(() => {
    soundFx.playPop();
    setRecallInput(['', '', '']);
    setPhase('recall');
  }, []);

  const getChunks = (): string[][] => {
    if (slices.length === 0) return [digits];
    const sorted = [...slices].sort((a, b) => a - b);
    const result: string[][] = [];
    let start = 0;
    for (const sliceIdx of sorted) {
      result.push(digits.slice(start, sliceIdx + 1));
      start = sliceIdx + 1;
    }
    result.push(digits.slice(start));
    return result;
  };

  const handleRecallSubmit = useCallback(() => {
    const chunks = getChunks();
    const expected = chunks.map((c) => c.join(''));
    const correct = recallInput.every((input, i) => input === expected[i]);

    if (correct) {
      soundFx.playSuccess();
      setPhase('complete');
    } else {
      soundFx.playGentleError();
      setRecallErrors((e) => e + 1);
      // Highlight which ones are wrong
    }
  }, [recallInput, digits, slices]);

  const getStars = (): 1 | 2 | 3 => {
    if (recallErrors === 0) return 3;
    if (recallErrors <= 1) return 2;
    return 1;
  };

  const chunks = getChunks();

  return (
    <div className="w-full max-w-2xl mx-auto my-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full bg-success-light/50 border border-success/40 text-success-dark shadow-sm">
          <Scissors className="w-3.5 h-3.5" /> Rhythm Slicer
        </span>
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-3">
          {phase === 'slice' && 'Slice 10 Digits Into 3 Chunks'}
          {phase === 'rhythm' && '🎵 Feel the Chunk Rhythm'}
          {phase === 'recall' && '🧠 Type the Chunks From Memory'}
          {phase === 'complete' && '🏆 Chunking Mastered!'}
        </h3>
        <p className="text-sm font-bold text-ink-muted mt-1 max-w-md mx-auto">
          {phase === 'slice' && 'Tap the scissors between digits to create groups: [981] - [240] - [6735]'}
          {phase === 'rhythm' && 'Watch the chunks pulse in sequence — feel the rhythm of grouped memory!'}
          {phase === 'recall' && 'The digits vanished! Type each chunk from memory.'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── SLICE Phase ─── */}
        {phase === 'slice' && (
          <motion.div
            key="slice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center"
          >
            {/* Digit conveyor track */}
            <div className="w-full p-5 sm:p-8 bg-gradient-to-r from-bg-blue via-bg-lavender to-bg-blue rounded-4xl border-2 border-primary/20 shadow-inner overflow-x-auto">
              <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                {digits.map((digit, idx) => {
                  const hasSliceAfter = slices.includes(idx);
                  // Determine which chunk this digit belongs to
                  let chunkIndex = 0;
                  for (const s of slices) {
                    if (idx > s) chunkIndex++;
                  }
                  const chunkColor = slices.length > 0 ? CHUNK_COLORS[chunkIndex % CHUNK_COLORS.length] : null;

                  return (
                    <React.Fragment key={idx}>
                      {/* Digit bubble */}
                      <motion.div
                        whileHover={{ scale: 1.1, y: -4 }}
                        className={`w-10 h-14 sm:w-12 sm:h-16 rounded-2xl font-heading font-extrabold text-2xl sm:text-3xl flex items-center justify-center select-none transition-all border-2 shadow-sm ${
                          chunkColor
                            ? `${chunkColor.bg} ${chunkColor.border} ${chunkColor.text}`
                            : 'bg-white border-secondary text-ink'
                        }`}
                      >
                        {digit}
                      </motion.div>

                      {/* Scissor divider */}
                      {idx < digits.length - 1 && (
                        <motion.button
                          type="button"
                          onClick={() => toggleSlice(idx)}
                          whileTap={{ scale: 0.85 }}
                          aria-label={`Toggle slice after digit ${digit}`}
                          className={`w-6 sm:w-8 h-14 sm:h-16 rounded-xl flex items-center justify-center transition-all ${
                            hasSliceAfter
                              ? 'bg-accent text-ink scale-110 shadow-float border-2 border-white glow-pulse-accent'
                              : 'text-ink-muted/30 hover:text-primary hover:bg-white/60 border border-dashed border-secondary-light/40'
                          }`}
                        >
                          <Scissors className={`w-3.5 h-3.5 transition-transform ${hasSliceAfter ? 'rotate-90' : ''}`} />
                        </motion.button>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Chunk preview */}
            <div className="w-full mt-5 p-4 rounded-3xl bg-bg-lavender/60 border border-secondary-light/40 flex items-center justify-center gap-3">
              <span className="text-xs font-bold text-ink-muted uppercase">Your Chunks:</span>
              <div className="flex items-center gap-2 font-heading font-extrabold text-lg">
                {chunks.map((chunk, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-secondary-light mx-1">·</span>}
                    <motion.span
                      layout
                      className={`px-3 py-1 rounded-xl border-2 ${
                        CHUNK_COLORS[i % CHUNK_COLORS.length].bg
                      } ${CHUNK_COLORS[i % CHUNK_COLORS.length].border} ${
                        CHUNK_COLORS[i % CHUNK_COLORS.length].text
                      }`}
                    >
                      [{chunk.join('')}]
                    </motion.span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full max-w-md flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => { soundFx.playPop(); setSlices([]); }}
                className="px-5 py-3 rounded-full border border-secondary-light/60 font-bold text-ink-muted hover:bg-bg-lavender flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleTestSlice}
                disabled={slices.length === 0}
                className={`flex-1 py-4 rounded-full font-heading font-extrabold text-lg shadow-float transition-all flex items-center justify-center gap-2 btn-bouncy ${
                  isCorrectChunking
                    ? 'bg-gradient-to-r from-success to-success-dark text-white'
                    : 'bg-gradient-to-r from-primary to-primary-dark text-white disabled:opacity-40'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                {isCorrectChunking ? 'Perfect Rhythm! Continue' : 'Test Chunking'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── RHYTHM Phase ─── */}
        {phase === 'rhythm' && (
          <motion.div
            key="rhythm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-success/40 flex flex-col items-center"
          >
            {/* Animated chunks pulsing in rhythm */}
            <div className="flex items-center gap-4 sm:gap-6 mb-8">
              {chunks.map((chunk, i) => (
                <motion.div
                  key={i}
                  animate={
                    rhythmPulseIndex === i
                      ? { scale: [1, 1.15, 1], y: [0, -8, 0] }
                      : { scale: 1, y: 0 }
                  }
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className={`px-5 sm:px-6 py-4 sm:py-5 rounded-3xl border-3 font-heading font-extrabold text-2xl sm:text-3xl shadow-card transition-all ${
                    CHUNK_COLORS[i % CHUNK_COLORS.length].bg
                  } ${CHUNK_COLORS[i % CHUNK_COLORS.length].border} ${
                    CHUNK_COLORS[i % CHUNK_COLORS.length].text
                  } ${rhythmPulseIndex === i ? CHUNK_COLORS[i % CHUNK_COLORS.length].glow : ''}`}
                >
                  {chunk.join('')}
                </motion.div>
              ))}
            </div>

            {/* Rhythm beat indicators */}
            <div className="flex items-center gap-3 mb-6">
              {chunks.map((_, i) => (
                <motion.div
                  key={i}
                  animate={
                    rhythmPulseIndex === i
                      ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }
                      : {}
                  }
                  transition={{ duration: 0.6 }}
                  className={`w-4 h-4 rounded-full ${
                    rhythmPulseIndex === i
                      ? 'bg-accent shadow-glow-accent'
                      : 'bg-secondary-light/30'
                  }`}
                />
              ))}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => animateRhythm()}
              className="px-6 py-3 rounded-full bg-bg-lavender border border-secondary-light/60 font-bold text-ink-muted flex items-center gap-2 mb-4 hover:bg-secondary-light/20 transition-colors"
            >
              <Music className="w-4 h-4" /> Replay Rhythm
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRecall}
              className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-ink font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
            >
              <Zap className="w-5 h-5" /> Test My Memory — Type the Chunks!
            </motion.button>
          </motion.div>
        )}

        {/* ─── RECALL Phase ─── */}
        {phase === 'recall' && (
          <motion.div
            key="recall"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-accent/40 flex flex-col items-center"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              {chunks.map((chunk, i) => {
                const expected = chunk.join('');
                const isCorrect = recallInput[i] === expected;
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-extrabold text-ink-muted uppercase">
                      Chunk {i + 1}
                    </span>
                    <input
                      type="text"
                      value={recallInput[i]}
                      onChange={(e) => {
                        const newInput = [...recallInput];
                        newInput[i] = e.target.value;
                        setRecallInput(newInput);
                      }}
                      placeholder="???"
                      maxLength={chunk.length}
                      className={`w-24 sm:w-28 px-3 py-3 rounded-2xl border-2 font-heading font-extrabold text-2xl text-center focus:outline-none transition-all ${
                        recallInput[i] === ''
                          ? `${CHUNK_COLORS[i % CHUNK_COLORS.length].border} bg-white focus:border-primary`
                          : isCorrect
                          ? 'border-success bg-success-light/20 text-success-dark'
                          : recallErrors > 0
                          ? 'border-error bg-error-light/20 text-error-dark animate-shake'
                          : `${CHUNK_COLORS[i % CHUNK_COLORS.length].border} bg-white`
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleRecallSubmit}
              disabled={recallInput.some((r) => !r)}
              className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float disabled:opacity-40 hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
            >
              <CheckCircle2 className="w-5 h-5" /> Check My Recall
            </motion.button>
          </motion.div>
        )}

        {/* ─── COMPLETE ─── */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-dramatic border-2 border-success/40 flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center text-4xl shadow-glow-accent mb-4"
            >
              ⚡
            </motion.div>

            <h4 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mb-2">
              Chunking Power Unlocked!
            </h4>

            <p className="text-sm font-bold text-ink-muted mb-4 text-center max-w-sm">
              You sliced 10 random digits into 3 memorable chunks and recalled them perfectly!
            </p>

            <StarRating stars={getStars()} size={52} className="mb-6" />

            {/* Show the chunks */}
            <div className="flex items-center gap-3 mb-6">
              {chunks.map((chunk, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 rounded-2xl border-2 font-heading font-extrabold text-xl ${
                    CHUNK_COLORS[i % CHUNK_COLORS.length].bg
                  } ${CHUNK_COLORS[i % CHUNK_COLORS.length].border} ${
                    CHUNK_COLORS[i % CHUNK_COLORS.length].text
                  }`}
                >
                  {chunk.join('')}
                </div>
              ))}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-success to-success-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
            >
              <CheckCircle2 className="w-5 h-5" /> Continue to Practice
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
