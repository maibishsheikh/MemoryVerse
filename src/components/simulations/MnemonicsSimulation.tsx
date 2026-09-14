'use client';

import React, { useState } from 'react';
import { SimulationConfig } from '@/types/lesson';
import { Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface MnemonicsSimulationProps {
  config: SimulationConfig;
  onComplete: () => void;
}

const MNEMONIC_CARDS = [
  { id: '1', letter: 'M', word: 'My', planet: 'Mercury ☿️' },
  { id: '2', letter: 'V', word: 'Very', planet: 'Venus ♀️' },
  { id: '3', letter: 'E', word: 'Educated', planet: 'Earth 🌍' },
  { id: '4', letter: 'M', word: 'Mother', planet: 'Mars ♂️' },
  { id: '5', letter: 'J', word: 'Just', planet: 'Jupiter ♃' },
  { id: '6', letter: 'S', word: 'Served', planet: 'Saturn ♄' },
  { id: '7', letter: 'U', word: 'Us', planet: 'Uranus ♅' },
  { id: '8', letter: 'N', word: 'Nachos', planet: 'Neptune ♆' },
];

export default function MnemonicsSimulation({
  config,
  onComplete,
}: MnemonicsSimulationProps) {
  const [activeStep, setActiveStep] = useState(0);

  const handleNextWord = () => {
    soundFx.playPop();
    if (activeStep < MNEMONIC_CARDS.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      soundFx.playSuccess();
      onComplete();
    }
  };

  const revealedCards = MNEMONIC_CARDS.slice(0, activeStep + 1);

  return (
    <div className="w-full max-w-3xl mx-auto my-4 bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-accent-light text-ink">
          Cosmic Acronym Engine
        </span>
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-2">
          Solar System Planet Bridge
        </h3>
        <p className="text-sm font-bold text-ink-muted mt-1">
          Connect each word in the sentence to its corresponding solar planet in order!
        </p>
      </div>

      {/* Interactive Sentence Strip */}
      <div className="w-full min-h-36 p-6 bg-gradient-to-r from-bg-lavender via-bg-blue to-bg-lavender rounded-4xl border-2 border-primary/30 flex items-center justify-center flex-wrap gap-2 shadow-inner">
        {revealedCards.map((card, idx) => (
          <div
            key={card.id}
            className={`p-3 rounded-2xl border-2 shadow-sm text-center transition-all ${
              idx === activeStep
                ? 'border-accent bg-white scale-110 shadow-float z-10'
                : 'border-secondary-light bg-white/80'
            }`}
          >
            <div className="text-xs font-extrabold text-primary-dark">
              {card.planet}
            </div>
            <div className="font-heading font-extrabold text-lg sm:text-xl text-ink">
              <span className="text-accent-dark underline decoration-2 font-black">
                {card.letter}
              </span>
              {card.word.slice(1)}
            </div>
          </div>
        ))}
      </div>

      {/* Current Planet Highlight Card */}
      <div className="w-full max-w-md mt-6 p-4 rounded-3xl bg-bg-blue border border-primary/40 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-ink-muted uppercase block">
            Planet #{activeStep + 1} from Sun
          </span>
          <span className="font-heading font-extrabold text-xl text-ink">
            {MNEMONIC_CARDS[activeStep].planet}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-ink-muted uppercase block">
            Mnemonic Word
          </span>
          <span className="font-heading font-extrabold text-xl text-accent-dark">
            "{MNEMONIC_CARDS[activeStep].word}"
          </span>
        </div>
      </div>

      {/* Step Action Button */}
      <div className="w-full max-w-md mt-6">
        <button
          type="button"
          onClick={handleNextWord}
          className="w-full py-4 rounded-full bg-primary text-white font-heading font-extrabold text-lg shadow-float hover:bg-primary-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
        >
          {activeStep === MNEMONIC_CARDS.length - 1 ? (
            <>
              <CheckCircle2 className="w-5 h-5" /> Sentence Bridge Complete!
            </>
          ) : (
            <>
              Next Planet: {MNEMONIC_CARDS[activeStep + 1]?.planet} <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
