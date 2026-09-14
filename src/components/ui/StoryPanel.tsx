'use client';

import React, { useState } from 'react';
import { StoryPanel as StoryPanelType } from '@/types/lesson';
import Character from './Character';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface StoryPanelProps {
  panels: StoryPanelType[];
  onComplete: () => void;
}

export default function StoryPanel({ panels, onComplete }: StoryPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPanel = panels[currentIndex] || panels[0];

  const handleNext = () => {
    soundFx.playPop();
    if (currentIndex < panels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      soundFx.playSuccess();
      onComplete();
    }
  };

  const handlePrev = () => {
    soundFx.playPop();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center">
      {/* Panel Progress Indicators */}
      <div className="flex items-center gap-2 mb-6">
        {panels.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 bg-primary shadow-sm'
                : idx < currentIndex
                ? 'w-4 bg-success-light'
                : 'w-2.5 bg-secondary-light/40'
            }`}
            aria-label={`Go to story slide ${idx + 1}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPanel.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="w-full flex flex-col items-center text-center gap-6"
        >
          {/* Animated Character illustration */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary-light/30 via-secondary-light/20 to-accent-light/30 rounded-full blur-xl -z-10" />
            <Character
              name={currentPanel.character || 'professor_piko'}
              size="lg"
              emotion={
                currentPanel.character === 'mia' && currentIndex === 0
                  ? 'thinking'
                  : currentPanel.character === 'aarav' && currentIndex === 0
                  ? 'curious'
                  : 'happy'
              }
            />
          </div>

          {/* Speech Bubble / Story Narrative Card */}
          <div className="relative max-w-xl bg-bg-lavender rounded-3xl p-6 sm:p-8 border border-secondary-light shadow-sm text-ink font-bold text-lg sm:text-xl leading-relaxed">
            {/* Triangular tail pointing up to character */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-bg-lavender" />
            
            <p className="text-ink">
              "{currentPanel.text}"
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="w-full max-w-xl flex items-center justify-between gap-4 mt-8 pt-4 border-t border-secondary-light/30">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all ${
            currentIndex === 0
              ? 'opacity-0 pointer-events-none'
              : 'border border-secondary-light text-ink-muted hover:bg-bg-lavender hover:text-ink'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-extrabold text-base shadow-float hover:shadow-lg transition-all btn-bouncy"
        >
          {currentIndex === panels.length - 1 ? (
            <>
              Let's Learn the Trick <Sparkles className="w-5 h-5 text-accent animate-spin" />
            </>
          ) : (
            <>
              Next <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
