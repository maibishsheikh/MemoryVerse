'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { StoryPanel as StoryPanelType } from '@/types/lesson';
import Character from './Character';
import TypewriterText from './TypewriterText';
import SceneBackground from './SceneBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface StoryPanelProps {
  panels: StoryPanelType[];
  onComplete: () => void;
}

// Map character to scene preset
function getSceneForCharacter(character: StoryPanelType['character'], panelIndex: number): 'classroom' | 'bedroom' | 'space' | 'garden' | 'ocean' | 'default' {
  if (character === 'byte') return 'space';
  if (character === 'professor_piko') return panelIndex % 2 === 0 ? 'classroom' : 'garden';
  if (character === 'mia') return panelIndex === 0 ? 'bedroom' : 'classroom';
  if (character === 'aarav') return 'garden';
  return 'default';
}

function getEmotionForPanel(character: StoryPanelType['character'], panelIndex: number, totalPanels: number): 'happy' | 'curious' | 'thinking' | 'cheering' | 'surprised' {
  if (panelIndex === 0) {
    if (character === 'mia') return 'thinking';
    if (character === 'aarav') return 'curious';
  }
  if (panelIndex === totalPanels - 1) return 'cheering';
  if (character === 'professor_piko') return 'happy';
  if (panelIndex === 1) return 'curious';
  return 'happy';
}

// Character entrance direction
function getCharacterEntrance(panelIndex: number) {
  return panelIndex % 2 === 0 ? { x: -60, opacity: 0 } : { x: 60, opacity: 0 };
}

export default function StoryPanel({ panels, onComplete }: StoryPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [textComplete, setTextComplete] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const currentPanel = panels[currentIndex] || panels[0];
  const scene = useMemo(
    () => getSceneForCharacter(currentPanel.character, currentIndex),
    [currentPanel.character, currentIndex]
  );
  const emotion = useMemo(
    () => getEmotionForPanel(currentPanel.character, currentIndex, panels.length),
    [currentPanel.character, currentIndex, panels.length]
  );

  const handleNext = useCallback(() => {
    soundFx.playPop();
    if (currentIndex < panels.length - 1) {
      setDirection(1);
      setTextComplete(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      soundFx.playSuccess();
      onComplete();
    }
  }, [currentIndex, panels.length, onComplete]);

  const handlePrev = useCallback(() => {
    soundFx.playPop();
    if (currentIndex > 0) {
      setDirection(-1);
      setTextComplete(false);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleTextComplete = useCallback(() => {
    setTextComplete(true);
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.92,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      scale: 0.92,
    }),
  };

  return (
    <SceneBackground scene={scene} intensity="vivid" className="w-full max-w-3xl mx-auto my-4">
      <div className="p-6 sm:p-10 flex flex-col items-center">
        {/* Panel Progress — Glowing dots */}
        <div className="flex items-center gap-2.5 mb-8">
          {panels.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setTextComplete(false);
                setCurrentIndex(idx);
              }}
              className={`rounded-full transition-all duration-500 ${
                idx === currentIndex
                  ? 'w-10 h-3 bg-primary shadow-glow-primary'
                  : idx < currentIndex
                  ? 'w-4 h-3 bg-success shadow-sm'
                  : 'w-3 h-3 bg-white/50'
              }`}
              aria-label={`Go to story slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Scene counter badge */}
        <motion.div
          key={`badge-${currentIndex}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white/50 text-[11px] font-extrabold text-ink-muted uppercase tracking-wider mb-6 shadow-sm backdrop-blur-sm"
        >
          <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] text-primary-dark font-black">
            {currentIndex + 1}
          </span>
          <span>of {panels.length}</span>
        </motion.div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPanel.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full flex flex-col items-center text-center gap-6"
          >
            {/* Character with entrance animation */}
            <motion.div
              className="relative"
              initial={getCharacterEntrance(currentIndex)}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            >
              {/* Glowing aura behind character */}
              <motion.div
                className="absolute -inset-6 rounded-full -z-10"
                animate={{
                  background: [
                    'radial-gradient(circle, rgba(108,155,216,0.15) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(255,200,92,0.2) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(183,159,224,0.15) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(108,155,216,0.15) 0%, transparent 70%)',
                  ],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <Character
                name={currentPanel.character || 'professor_piko'}
                size="lg"
                emotion={emotion}
              />
            </motion.div>

            {/* Speech Bubble with Typewriter */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 250, damping: 22 }}
              className="relative max-w-xl w-full"
            >
              {/* Speech triangle */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-white/90 z-10" />

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/60 shadow-card text-ink font-bold text-lg sm:text-xl leading-relaxed">
                {/* Character name tag */}
                {currentPanel.character && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-extrabold text-primary-dark uppercase tracking-wider">
                      {currentPanel.character === 'professor_piko'
                        ? 'Professor Piko'
                        : currentPanel.character === 'byte'
                        ? 'Byte'
                        : currentPanel.character === 'mia'
                        ? 'Mia'
                        : currentPanel.character === 'aarav'
                        ? 'Aarav'
                        : 'Narrator'}
                    </span>
                  </div>
                )}

                <TypewriterText
                  key={`text-${currentPanel.id}`}
                  text={currentPanel.text}
                  speed={30}
                  onComplete={handleTextComplete}
                  className="text-ink"
                />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xl flex items-center justify-between gap-4 mt-8 pt-5 border-t border-white/30"
        >
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all ${
              currentIndex === 0
                ? 'opacity-0 pointer-events-none'
                : 'bg-white/60 backdrop-blur-sm border border-white/50 text-ink-muted hover:bg-white/80 hover:text-ink shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <motion.button
            onClick={handleNext}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-heading font-extrabold text-base shadow-float hover:shadow-lg transition-all btn-bouncy ${
              textComplete
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                : 'bg-white/80 text-ink-muted border border-white/50'
            }`}
          >
            {currentIndex === panels.length - 1 ? (
              <>
                Let&apos;s Learn the Trick <Sparkles className="w-5 h-5 text-accent animate-wiggle-loop" />
              </>
            ) : (
              <>
                Next <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </SceneBackground>
  );
}
