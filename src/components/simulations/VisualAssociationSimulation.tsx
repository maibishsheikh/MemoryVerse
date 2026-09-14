'use client';

import React, { useState } from 'react';
import { SimulationConfig } from '@/types/lesson';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface VisualAssociationSimulationProps {
  config: SimulationConfig;
  onComplete: () => void;
}

const PEGS = [
  { number: 2, peg: 'Swan', icon: '🦢', target: 'Lake of Cold Milk', shapeReason: 'Curved neck looks like a 2' },
  { number: 5, peg: 'Hand', icon: '✋', target: 'Shiny Gold Ring', shapeReason: '5 outstretched fingers' },
  { number: 7, peg: 'Axe', icon: '🪓', target: 'Giant Watermelon', shapeReason: 'Sharp angled blade of a 7' },
  { number: 8, peg: 'Snowman', icon: '⛄', target: 'Carrot Nose', shapeReason: 'Two stacked round snowballs' },
];

export default function VisualAssociationSimulation({
  config,
  onComplete,
}: VisualAssociationSimulationProps) {
  const [activePegIndex, setActivePegIndex] = useState(0);
  const [isLinked, setIsLinked] = useState<Record<number, boolean>>({});
  const [isBlindTest, setIsBlindTest] = useState(false);
  const [testedAnswers, setTestedAnswers] = useState<Record<number, boolean>>({});

  const currentPeg = PEGS[activePegIndex];

  const handleLinkCurrent = () => {
    soundFx.playPop();
    setIsLinked((prev) => ({ ...prev, [currentPeg.number]: true }));
    if (activePegIndex < PEGS.length - 1) {
      setActivePegIndex(activePegIndex + 1);
    }
  };

  const allLinked = PEGS.every((p) => isLinked[p.number]);

  const handleStartBlindTest = () => {
    soundFx.playPop();
    setIsBlindTest(true);
  };

  const handleRecallSelect = (num: number, selectedPeg: string) => {
    const pegObj = PEGS.find((p) => p.number === num);
    if (pegObj?.peg === selectedPeg) {
      soundFx.playSuccess();
      setTestedAnswers((prev) => ({ ...prev, [num]: true }));
    } else {
      soundFx.playGentleError();
    }
  };

  const allTested = PEGS.every((p) => testedAnswers[p.number]);

  return (
    <div className="w-full max-w-2xl mx-auto my-4 bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-secondary-light/50 text-primary-dark">
          Number-Peg Visualizer
        </span>
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-2">
          {!isBlindTest
            ? 'Anchor Numbers to Visual Picture Pegs'
            : 'Blind Picture Recall Test'}
        </h3>
        <p className="text-sm font-bold text-ink-muted mt-1">
          {!isBlindTest
            ? 'Connect each digit to an unforgettable picture shaped like the number.'
            : 'The numbers are hidden! Can you recall the peg pictures from memory?'}
        </p>
      </div>

      {!isBlindTest ? (
        /* Peg Learning & Linking Stage */
        <div className="w-full space-y-6">
          {/* Active Peg Visual Card */}
          <div className="w-full p-6 sm:p-8 bg-gradient-to-tr from-bg-blue to-bg-lavender rounded-4xl border-2 border-primary/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-primary text-white font-heading font-extrabold text-5xl flex items-center justify-center shadow-float">
                {currentPeg.number}
              </div>
              <div>
                <div className="text-xs font-extrabold text-primary-dark uppercase">
                  Peg Object
                </div>
                <div className="font-heading font-extrabold text-3xl text-ink flex items-center gap-2">
                  <span>{currentPeg.icon}</span> {currentPeg.peg}
                </div>
                <div className="text-xs font-bold text-ink-muted mt-1">
                  Why: {currentPeg.shapeReason}
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right bg-white/80 p-3 rounded-2xl border border-secondary-light/50">
              <span className="text-[11px] font-bold text-ink-muted uppercase block">
                Target Memory Item
              </span>
              <span className="font-extrabold text-sm text-ink">
                🎯 {currentPeg.target}
              </span>
            </div>
          </div>

          {/* Peg Selector Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {PEGS.map((p, idx) => (
              <button
                key={p.number}
                onClick={() => {
                  soundFx.playPop();
                  setActivePegIndex(idx);
                }}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  activePegIndex === idx
                    ? 'border-primary bg-primary text-white shadow-sm font-extrabold'
                    : isLinked[p.number]
                    ? 'border-success bg-success-light/20 text-ink font-bold'
                    : 'border-secondary-light bg-white text-ink-muted hover:bg-bg-lavender'
                }`}
              >
                <div className="text-xl">{p.icon}</div>
                <div className="text-xs mt-1">Digit {p.number}</div>
              </button>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-2">
            {!allLinked ? (
              <button
                onClick={handleLinkCurrent}
                className="w-full max-w-md py-4 rounded-full bg-primary text-white font-heading font-extrabold text-lg shadow-float hover:bg-primary-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
              >
                <Sparkles className="w-5 h-5" /> Link Digit {currentPeg.number} ({currentPeg.peg}) & Next
              </button>
            ) : (
              <button
                onClick={handleStartBlindTest}
                className="w-full max-w-md py-4 rounded-full bg-accent text-ink font-heading font-extrabold text-lg shadow-float hover:bg-accent-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
              >
                <EyeOff className="w-5 h-5" /> Test My Blind Recall Now!
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Blind Recall Test Stage */
        <div className="w-full space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PEGS.map((p) => {
              const isAnswered = testedAnswers[p.number];
              return (
                <div
                  key={p.number}
                  className={`p-5 rounded-3xl border-2 transition-all ${
                    isAnswered
                      ? 'border-success bg-success-light/20'
                      : 'border-secondary-light bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-heading font-extrabold text-lg text-ink">
                      Digit {p.number} Peg:
                    </span>
                    {isAnswered ? (
                      <span className="text-xs font-extrabold text-success-dark flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Recalled!
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-ink-muted">
                        Select picture:
                      </span>
                    )}
                  </div>

                  {isAnswered ? (
                    <div className="font-heading font-extrabold text-xl text-ink flex items-center gap-2">
                      <span>{p.icon}</span> {p.peg}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {['Swan', 'Hand', 'Axe', 'Snowman'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleRecallSelect(p.number, opt)}
                          className="py-2 px-3 rounded-xl border border-secondary-light/60 bg-bg-lavender font-bold text-xs text-ink hover:bg-primary hover:text-white transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-2">
            {allTested ? (
              <button
                onClick={onComplete}
                className="w-full max-w-md py-4 rounded-full bg-success text-white font-heading font-extrabold text-lg shadow-float hover:bg-success-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
              >
                <CheckCircle2 className="w-5 h-5" /> All Pegs Recalled! Continue
              </button>
            ) : (
              <p className="text-xs font-bold text-ink-muted text-center">
                Match all 4 hidden pegs to unlock the practice questions!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
