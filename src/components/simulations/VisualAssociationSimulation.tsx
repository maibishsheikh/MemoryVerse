'use client';

import React, { useState, useCallback } from 'react';
import { SimulationConfig } from '@/types/lesson';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Eye, EyeOff, Shuffle } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';
import StarRating from '../ui/StarRating';

interface VisualAssociationSimulationProps {
  config: SimulationConfig;
  onComplete: () => void;
}

const PEGS = [
  { number: 2, peg: 'Swan', icon: '🦢', target: 'Lake of Cold Milk', shapeReason: 'Curved neck looks like a 2', color: '#6C9BD8' },
  { number: 5, peg: 'Hand', icon: '✋', target: 'Shiny Gold Ring', shapeReason: '5 outstretched fingers', color: '#FFC85C' },
  { number: 7, peg: 'Axe', icon: '🪓', target: 'Giant Watermelon', shapeReason: 'Sharp angled blade of a 7', color: '#FF8A80' },
  { number: 8, peg: 'Snowman', icon: '⛄', target: 'Carrot Nose', shapeReason: 'Two stacked round snowballs', color: '#B79FE0' },
];

export default function VisualAssociationSimulation({
  config,
  onComplete,
}: VisualAssociationSimulationProps) {
  const [phase, setPhase] = useState<'learn' | 'match' | 'complete'>('learn');
  const [activePegIndex, setActivePegIndex] = useState(0);
  const [isLinked, setIsLinked] = useState<Record<number, boolean>>({});
  const [showingShape, setShowingShape] = useState(false);

  // Match game state
  const [matchCards, setMatchCards] = useState<{ id: string; type: 'number' | 'peg'; value: string; label: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchErrors, setMatchErrors] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPeg = PEGS[activePegIndex];
  const allLinked = PEGS.every((p) => isLinked[p.number]);

  const handleLinkCurrent = useCallback(() => {
    soundFx.playSuccess();
    setIsLinked((prev) => ({ ...prev, [currentPeg.number]: true }));
    setShowingShape(false);
    if (activePegIndex < PEGS.length - 1) {
      setTimeout(() => setActivePegIndex(activePegIndex + 1), 300);
    }
  }, [activePegIndex, currentPeg]);

  const handleShowShape = useCallback(() => {
    soundFx.playPop();
    setShowingShape(true);
    // Auto-hide after 3 seconds
    setTimeout(() => setShowingShape(false), 3000);
  }, []);

  const handleStartMatch = useCallback(() => {
    soundFx.playPop();
    // Create shuffled cards: number cards + peg cards
    const numberCards = PEGS.map((p) => ({
      id: `num-${p.number}`,
      type: 'number' as const,
      value: String(p.number),
      label: String(p.number),
      flipped: false,
      matched: false,
    }));
    const pegCards = PEGS.map((p) => ({
      id: `peg-${p.number}`,
      type: 'peg' as const,
      value: String(p.number),
      label: `${p.icon} ${p.peg}`,
      flipped: false,
      matched: false,
    }));
    // Shuffle all cards together
    const allCards = [...numberCards, ...pegCards].sort(() => Math.random() - 0.5);
    setMatchCards(allCards);
    setFlippedCards([]);
    setMatchErrors(0);
    setPhase('match');
  }, []);

  const handleCardFlip = useCallback((cardId: string) => {
    if (isProcessing) return;
    const card = matchCards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    soundFx.playPop();
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Update card state
    setMatchCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const card1 = matchCards.find((c) => c.id === newFlipped[0])!;
      const card2 = matchCards.find((c) => c.id === newFlipped[1])!;

      // Match if same value but different type
      if (card1.value === card2.value && card1.type !== card2.type) {
        soundFx.playSuccess();
        setTimeout(() => {
          setMatchCards((prev) =>
            prev.map((c) =>
              c.value === card1.value ? { ...c, matched: true, flipped: true } : c
            )
          );
          setFlippedCards([]);
          setIsProcessing(false);

          // Check if all matched
          const unmatched = matchCards.filter((c) => !c.matched && c.value !== card1.value);
          if (unmatched.length === 0) {
            setTimeout(() => setPhase('complete'), 500);
          }
        }, 500);
      } else {
        soundFx.playGentleError();
        setMatchErrors((e) => e + 1);
        setTimeout(() => {
          setMatchCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) && !c.matched ? { ...c, flipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsProcessing(false);
        }, 800);
      }
    }
  }, [flippedCards, matchCards, isProcessing]);

  const allMatched = matchCards.length > 0 && matchCards.every((c) => c.matched);

  const getStars = (): 1 | 2 | 3 => {
    if (matchErrors === 0) return 3;
    if (matchErrors <= 3) return 2;
    return 1;
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full bg-secondary-light/50 border border-secondary/40 text-primary-dark shadow-sm">
          <Eye className="w-3.5 h-3.5" /> Number-Peg Visualizer
        </span>
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-3">
          {phase === 'learn' && 'See the Number, See the Shape'}
          {phase === 'match' && '🃏 Memory Match Challenge'}
          {phase === 'complete' && '🏆 Perfect Visual Memory!'}
        </h3>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── LEARN Phase ─── */}
        {phase === 'learn' && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center"
          >
            {/* Active Peg Visual — Split Screen */}
            <div className="w-full rounded-4xl overflow-hidden border-2 border-primary/20 shadow-inner mb-6">
              <div className="flex items-stretch min-h-[200px]">
                {/* Number side */}
                <div className="flex-1 bg-gradient-to-br from-bg-blue to-bg-lavender flex flex-col items-center justify-center p-6 relative">
                  <motion.div
                    key={`num-${currentPeg.number}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-24 h-28 sm:w-28 sm:h-32 rounded-3xl flex items-center justify-center shadow-float border-4 border-white/50"
                    style={{ background: `linear-gradient(135deg, ${currentPeg.color}, ${currentPeg.color}dd)` }}
                  >
                    <span className="font-heading font-extrabold text-6xl sm:text-7xl text-white">
                      {currentPeg.number}
                    </span>
                  </motion.div>
                  <span className="text-xs font-extrabold text-primary-dark uppercase mt-3 tracking-wider">
                    Digit
                  </span>
                </div>

                {/* Divider with "looks like" arrow */}
                <div className="w-12 sm:w-16 flex flex-col items-center justify-center bg-white/80 relative">
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-primary-dark font-extrabold text-xl"
                  >
                    →
                  </motion.div>
                  <span className="text-[9px] font-bold text-ink-muted uppercase tracking-wide mt-1">looks like</span>
                </div>

                {/* Shape/Peg side */}
                <div className="flex-1 bg-gradient-to-br from-accent-light/30 to-bg flex flex-col items-center justify-center p-6">
                  <motion.div
                    key={`peg-${currentPeg.number}`}
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.2 }}
                    className="text-6xl sm:text-7xl"
                  >
                    {currentPeg.icon}
                  </motion.div>
                  <span className="font-heading font-extrabold text-xl text-ink mt-2">
                    {currentPeg.peg}
                  </span>
                  <span className="text-[10px] font-bold text-ink-muted mt-1 text-center max-w-[120px]">
                    {currentPeg.shapeReason}
                  </span>
                </div>
              </div>

              {/* Target memory item bar */}
              <div className="px-4 py-3 bg-white/90 border-t border-secondary-light/40 flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink-muted uppercase">Target Memory</span>
                <span className="text-sm font-extrabold text-ink">🎯 {currentPeg.target}</span>
              </div>
            </div>

            {/* Peg navigation tabs */}
            <div className="grid grid-cols-4 gap-2.5 w-full mb-6">
              {PEGS.map((p, idx) => (
                <motion.button
                  key={p.number}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    soundFx.playPop();
                    setActivePegIndex(idx);
                    setShowingShape(false);
                  }}
                  className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1 ${
                    activePegIndex === idx
                      ? 'border-primary bg-primary text-white shadow-float'
                      : isLinked[p.number]
                      ? 'border-success/40 bg-success-light/20 text-ink'
                      : 'border-secondary-light/60 bg-white text-ink-muted hover:bg-bg-lavender'
                  }`}
                >
                  <div className="text-xl">{p.icon}</div>
                  <div className="text-[11px] font-extrabold">Digit {p.number}</div>
                  {isLinked[p.number] && <CheckCircle2 className="w-3 h-3 text-success" />}
                </motion.button>
              ))}
            </div>

            {/* Action */}
            {!allLinked ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLinkCurrent}
                className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
              >
                <Sparkles className="w-5 h-5" /> Lock {currentPeg.peg} to Digit {currentPeg.number} & Next
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartMatch}
                className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-ink font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
              >
                <Shuffle className="w-5 h-5" /> Start Memory Match Game!
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ─── MATCH Phase ─── */}
        {phase === 'match' && (
          <motion.div
            key="match"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center"
          >
            <p className="text-sm font-bold text-ink-muted mb-4 text-center">
              Flip cards to match each number with its picture peg! Find all 4 pairs.
            </p>

            <div className="grid grid-cols-4 gap-3 w-full mb-6">
              {matchCards.map((card) => (
                <motion.button
                  key={card.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCardFlip(card.id)}
                  disabled={card.flipped || card.matched || isProcessing}
                  className={`relative h-24 sm:h-28 rounded-2xl border-2 transition-all flex items-center justify-center ${
                    card.matched
                      ? 'border-success/40 bg-success-light/20 shadow-sm'
                      : card.flipped
                      ? 'border-primary bg-white shadow-float'
                      : 'border-secondary-light bg-gradient-to-br from-primary/10 to-secondary/10 hover:border-primary/60 hover:shadow-md cursor-pointer'
                  }`}
                >
                  {card.flipped || card.matched ? (
                    <motion.div
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <span className={`font-heading font-extrabold ${card.type === 'number' ? 'text-3xl text-primary-dark' : 'text-2xl'}`}>
                        {card.label}
                      </span>
                      {card.matched && <CheckCircle2 className="w-4 h-4 text-success" />}
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ rotate: [0, 3, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-3xl text-secondary/40"
                    >
                      ❓
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="text-xs font-bold text-ink-muted">
              Mistakes: {matchErrors} • Matched: {matchCards.filter((c) => c.matched).length / 2} / {PEGS.length}
            </div>
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
              🧠
            </motion.div>

            <h4 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mb-2">
              All Pegs Mastered!
            </h4>

            <p className="text-sm font-bold text-ink-muted mb-4">
              {matchErrors === 0 ? 'Flawless memory! Zero mistakes!' : `${matchErrors} flip error${matchErrors > 1 ? 's' : ''} — great work!`}
            </p>

            <StarRating stars={getStars()} size={52} className="mb-6" />

            {/* Summary of pegs */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-sm mb-6">
              {PEGS.map((p) => (
                <div key={p.number} className="p-2.5 rounded-2xl bg-bg-lavender border border-secondary-light/40 text-center">
                  <div className="text-lg">{p.icon}</div>
                  <div className="text-xs font-extrabold text-primary-dark">{p.number} = {p.peg}</div>
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
