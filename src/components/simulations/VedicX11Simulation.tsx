'use client';

import React, { useState } from 'react';
import { SimulationConfig } from '@/types/lesson';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface VedicX11SimulationProps {
  config: SimulationConfig;
  onComplete: () => void;
}

export default function VedicX11Simulation({
  config,
  onComplete,
}: VedicX11SimulationProps) {
  const [stage, setStage] = useState<'together' | 'split' | 'solved'>('together');
  const [middleDigit, setMiddleDigit] = useState<string>('');
  const [isError, setIsError] = useState(false);

  const tensDigit = 4;
  const unitsDigit = 3;
  const correctSum = tensDigit + unitsDigit; // 7

  const handleSplit = () => {
    soundFx.playPop();
    setStage('split');
  };

  const handleDigitChange = (val: string) => {
    soundFx.playPop();
    setIsError(false);
    setMiddleDigit(val);
  };

  const handleVerify = () => {
    if (Number(middleDigit) === correctSum) {
      soundFx.playSuccess();
      setStage('solved');
    } else {
      soundFx.playGentleError();
      setIsError(true);
    }
  };

  const handleReset = () => {
    soundFx.playPop();
    setStage('together');
    setMiddleDigit('');
    setIsError(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center">
      {/* Simulation Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-accent-light text-ink">
          Interactive Vedic Simulation
        </span>
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-2">
          Split & Add the Digits: 43 × 11
        </h3>
        <p className="text-sm font-bold text-ink-muted mt-1">
          {stage === 'together' && 'Step 1: Pull the digits 4 and 3 apart!'}
          {stage === 'split' && `Step 2: Add ${tensDigit} + ${unitsDigit} and type the sum in the glowing middle!`}
          {stage === 'solved' && '🌟 Look at that! 43 × 11 = 473 instantly!'}
        </p>
      </div>

      {/* Interactive Digits Stage Canvas */}
      <div className="w-full h-64 bg-bg-blue/60 rounded-4xl border-2 border-primary/30 flex items-center justify-center relative overflow-hidden shadow-inner p-4">
        {/* Background glow when solved */}
        {stage === 'solved' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.6 }}
            className="absolute inset-0 bg-gradient-to-r from-accent-light via-success-light to-primary-light rounded-full blur-2xl pointer-events-none"
          />
        )}

        <div className="flex items-center justify-center gap-4 sm:gap-6 z-10">
          {/* Tens Digit (4) */}
          <motion.div
            animate={{
              x: stage === 'together' ? 20 : stage === 'split' || stage === 'solved' ? -40 : 0,
            }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="w-20 h-24 sm:w-24 sm:h-28 rounded-3xl bg-primary text-white font-heading font-extrabold text-5xl sm:text-6xl flex items-center justify-center shadow-float border-4 border-white select-none"
          >
            {tensDigit}
          </motion.div>

          {/* Glowing Middle Slot */}
          {stage !== 'together' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`w-20 h-24 sm:w-24 sm:h-28 rounded-3xl flex items-center justify-center border-4 shadow-float transition-all ${
                stage === 'solved'
                  ? 'bg-accent text-ink border-white font-heading font-extrabold text-5xl sm:text-6xl animate-bounce-soft'
                  : isError
                  ? 'bg-error-light/50 border-error animate-wiggle'
                  : 'bg-white border-accent shadow-glow-accent'
              }`}
            >
              {stage === 'solved' ? (
                <span>{correctSum}</span>
              ) : (
                <input
                  type="number"
                  value={middleDigit}
                  onChange={(e) => handleDigitChange(e.target.value)}
                  placeholder="?"
                  autoFocus
                  className="w-full text-center font-heading font-extrabold text-4xl sm:text-5xl text-ink bg-transparent focus:outline-none"
                />
              )}
            </motion.div>
          )}

          {/* Units Digit (3) */}
          <motion.div
            animate={{
              x: stage === 'together' ? -20 : stage === 'split' || stage === 'solved' ? 40 : 0,
            }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="w-20 h-24 sm:w-24 sm:h-28 rounded-3xl bg-secondary text-white font-heading font-extrabold text-5xl sm:text-6xl flex items-center justify-center shadow-float border-4 border-white select-none"
          >
            {unitsDigit}
          </motion.div>
        </div>
      </div>

      {/* Addition Helper Hint */}
      {stage === 'split' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 px-4 py-2 rounded-full bg-accent-light/50 border border-accent text-xs sm:text-sm font-extrabold text-ink flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-accent-dark" />
          <span>Formula: {tensDigit} + {unitsDigit} = {tensDigit + unitsDigit}</span>
        </motion.div>
      )}

      {/* Action Controls */}
      <div className="w-full max-w-md flex items-center justify-center gap-3 mt-6">
        {stage === 'together' && (
          <button
            type="button"
            onClick={handleSplit}
            className="w-full py-4 rounded-full bg-primary text-white font-heading font-extrabold text-lg shadow-float hover:bg-primary-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
          >
            <Sparkles className="w-5 h-5" /> Split the Digits Apart
          </button>
        )}

        {stage === 'split' && (
          <div className="w-full flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3 rounded-full border border-secondary-light font-bold text-ink-muted hover:bg-bg-lavender flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={!middleDigit}
              className="flex-1 py-4 rounded-full bg-accent text-ink font-heading font-extrabold text-lg shadow-float hover:bg-accent-dark disabled:opacity-40 transition-all flex items-center justify-center gap-2 btn-bouncy"
            >
              Verify Sum
            </button>
          </div>
        )}

        {stage === 'solved' && (
          <button
            type="button"
            onClick={onComplete}
            className="w-full py-4 rounded-full bg-success text-white font-heading font-extrabold text-lg shadow-float hover:bg-success-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
          >
            <CheckCircle2 className="w-5 h-5" /> Complete Simulation & Practice
          </button>
        )}
      </div>
    </div>
  );
}
