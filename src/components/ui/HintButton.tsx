'use client';

import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HintButtonProps {
  hints: string[];
  hintsRevealed: number;
  onRequestHint: () => void;
}

export default function HintButton({
  hints,
  hintsRevealed,
  onRequestHint,
}: HintButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!hints || hints.length === 0) return null;

  const hasUnrevealedHints = hintsRevealed < hints.length;

  return (
    <div className="w-full max-w-lg mx-auto my-3">
      <div className="flex items-center justify-between gap-3 bg-accent-light/30 border border-accent/40 rounded-3xl p-3 px-5 shadow-sm">
        <button
          onClick={() => {
            if (hintsRevealed === 0 && hasUnrevealedHints) {
              onRequestHint();
            }
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2.5 font-bold text-sm text-ink hover:text-primary-dark transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-accent/40 flex items-center justify-center text-accent-dark">
            <Lightbulb className="w-4 h-4 fill-accent" />
          </div>
          <span>
            {hintsRevealed === 0
              ? 'Need a secret hint?'
              : `Hints Revealed (${hintsRevealed}/${hints.length})`}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {hasUnrevealedHints && (
          <button
            onClick={() => {
              onRequestHint();
              setIsOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent text-ink font-extrabold text-xs shadow-sm hover:bg-accent-dark transition-all btn-bouncy"
          >
            <Sparkles className="w-3.5 h-3.5" /> Reveal Hint #{hintsRevealed + 1}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hintsRevealed > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white rounded-3xl mt-2 p-4 border border-secondary-light/60 shadow-sm space-y-2.5"
          >
            {hints.slice(0, hintsRevealed).map((hint, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-2xl bg-bg-lavender/60 border border-secondary-light/40"
              >
                <span className="w-6 h-6 rounded-full bg-secondary-light flex items-center justify-center text-xs font-extrabold text-primary-dark shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm font-bold text-ink leading-relaxed">
                  {hint}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
