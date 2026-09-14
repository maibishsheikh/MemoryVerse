'use client';

import React, { useState, useCallback } from 'react';
import { SimulationConfig } from '@/types/lesson';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2, Zap, Trophy } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';
import NumberPad from '../ui/NumberPad';
import StarRating from '../ui/StarRating';

interface VedicX11SimulationProps {
  config: SimulationConfig;
  onComplete: () => void;
}

// Generate a random 2-digit number where both digits sum < 10 (basic level)
function generateProblem() {
  const tens = Math.floor(Math.random() * 8) + 1; // 1-8
  const units = Math.floor(Math.random() * (9 - tens)) + 1; // ensure sum < 10
  return { tens, units, answer: tens * 100 + (tens + units) * 10 + units };
}

export default function VedicX11Simulation({
  config,
  onComplete,
}: VedicX11SimulationProps) {
  const [stage, setStage] = useState<'intro' | 'split' | 'input' | 'solved' | 'practice' | 'practice-input' | 'complete'>('intro');
  const [middleDigit, setMiddleDigit] = useState('');
  const [isError, setIsError] = useState(false);
  const [practiceProblems, setPracticeProblems] = useState<ReturnType<typeof generateProblem>[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [practiceErrors, setPracticeErrors] = useState(0);
  const [showPracticeResult, setShowPracticeResult] = useState(false);

  // Initial problem: 43 × 11
  const tensDigit = 4;
  const unitsDigit = 3;
  const correctSum = tensDigit + unitsDigit;

  const handleSplit = useCallback(() => {
    soundFx.playPop();
    setStage('split');
    // Auto-transition to input after split animation
    setTimeout(() => setStage('input'), 800);
  }, []);

  const handleVerify = useCallback(() => {
    if (Number(middleDigit) === correctSum) {
      soundFx.playSuccess();
      setIsError(false);
      setStage('solved');
    } else {
      soundFx.playGentleError();
      setIsError(true);
      setMiddleDigit('');
    }
  }, [middleDigit, correctSum]);

  const handleStartPractice = useCallback(() => {
    soundFx.playPop();
    const problems = [generateProblem(), generateProblem(), generateProblem()];
    setPracticeProblems(problems);
    setPracticeIndex(0);
    setPracticeAnswer('');
    setPracticeCorrect(0);
    setPracticeErrors(0);
    setStage('practice');
  }, []);

  const handlePracticeSubmit = useCallback(() => {
    const current = practiceProblems[practiceIndex];
    if (!current) return;

    if (Number(practiceAnswer) === current.answer) {
      soundFx.playSuccess();
      setPracticeCorrect((c) => c + 1);
      if (practiceIndex < practiceProblems.length - 1) {
        setPracticeIndex((i) => i + 1);
        setPracticeAnswer('');
      } else {
        setShowPracticeResult(true);
        setStage('complete');
      }
    } else {
      soundFx.playGentleError();
      setPracticeErrors((e) => e + 1);
      setPracticeAnswer('');
    }
  }, [practiceAnswer, practiceIndex, practiceProblems]);

  const getStars = (): 1 | 2 | 3 => {
    if (practiceErrors === 0) return 3;
    if (practiceErrors <= 2) return 2;
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
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full bg-accent-light/60 border border-accent/40 text-ink shadow-sm">
          <Zap className="w-3.5 h-3.5 text-accent-dark fill-accent" /> Interactive Simulation
        </span>
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-3">
          {stage === 'practice' || stage === 'practice-input' || stage === 'complete'
            ? '⚡ Lightning Round'
            : 'Split & Merge: Vedic × 11'}
        </h3>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── INTRO: Show the number 43 together ─── */}
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center"
          >
            <p className="text-sm font-bold text-ink-muted mb-6 max-w-md text-center">
              Watch the magic! The digits of <span className="font-extrabold text-ink">43</span> will split apart, and you'll find the secret number hiding between them.
            </p>

            {/* Number display */}
            <div className="w-full h-52 sm:h-64 bg-gradient-to-br from-bg-blue via-bg-lavender to-bg-blue rounded-4xl border-2 border-primary/20 flex items-center justify-center relative overflow-hidden shadow-inner-glow">
              {/* Background sparkles */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(rgba(108,155,216,0.12) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="flex items-center gap-1 z-10">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-24 h-28 sm:w-28 sm:h-32 rounded-3xl bg-gradient-to-b from-primary to-primary-dark text-white font-heading font-extrabold text-6xl sm:text-7xl flex items-center justify-center shadow-float border-4 border-white/50 select-none"
                >
                  4
                </motion.div>
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, delay: 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-24 h-28 sm:w-28 sm:h-32 rounded-3xl bg-gradient-to-b from-secondary to-secondary-dark text-white font-heading font-extrabold text-6xl sm:text-7xl flex items-center justify-center shadow-float border-4 border-white/50 select-none"
                >
                  3
                </motion.div>
              </div>

              {/* × 11 label */}
              <div className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-secondary-light/60 font-heading font-extrabold text-lg text-primary-dark shadow-sm">
                × 11
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleSplit}
              whileTap={{ scale: 0.95 }}
              className="w-full max-w-md mt-6 py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy glow-pulse"
            >
              <Sparkles className="w-5 h-5" /> Split the Digits Apart!
            </motion.button>
          </motion.div>
        )}

        {/* ─── SPLIT + INPUT: Digits separated, enter middle number ─── */}
        {(stage === 'split' || stage === 'input') && (
          <motion.div
            key="split"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center"
          >
            <p className="text-sm font-bold text-ink-muted mb-6 text-center max-w-md">
              The digits pulled apart! Now add <span className="font-extrabold text-primary-dark">{tensDigit}</span> + <span className="font-extrabold text-secondary-dark">{unitsDigit}</span> and enter the sum on the number pad.
            </p>

            {/* Split digit canvas */}
            <div className="w-full h-52 sm:h-64 bg-gradient-to-br from-bg-blue via-bg-lavender to-bg-blue rounded-4xl border-2 border-primary/20 flex items-center justify-center relative overflow-hidden shadow-inner-glow">
              <div className="flex items-center gap-6 sm:gap-10 z-10">
                {/* Tens digit - slides left */}
                <motion.div
                  initial={{ x: 30 }}
                  animate={{ x: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="w-22 h-26 sm:w-26 sm:h-30 rounded-3xl bg-gradient-to-b from-primary to-primary-dark text-white font-heading font-extrabold text-6xl sm:text-7xl flex items-center justify-center shadow-float border-4 border-white/50 select-none"
                  style={{ width: '5.5rem', height: '6.5rem' }}
                >
                  {tensDigit}
                </motion.div>

                {/* Middle slot - energy glowing */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
                  className={`relative flex items-center justify-center rounded-3xl border-4 shadow-float transition-all ${
                    isError
                      ? 'bg-error-light/30 border-error animate-shake w-20 h-24 sm:w-24 sm:h-28'
                      : 'bg-white border-accent glow-pulse-accent w-20 h-24 sm:w-24 sm:h-28'
                  }`}
                >
                  {middleDigit ? (
                    <motion.span
                      key={middleDigit}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="font-heading font-extrabold text-5xl sm:text-6xl text-accent-dark"
                    >
                      {middleDigit}
                    </motion.span>
                  ) : (
                    <motion.span
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="font-heading font-extrabold text-4xl text-accent/40"
                    >
                      ?
                    </motion.span>
                  )}
                </motion.div>

                {/* Units digit - slides right */}
                <motion.div
                  initial={{ x: -30 }}
                  animate={{ x: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="rounded-3xl bg-gradient-to-b from-secondary to-secondary-dark text-white font-heading font-extrabold text-6xl sm:text-7xl flex items-center justify-center shadow-float border-4 border-white/50 select-none"
                  style={{ width: '5.5rem', height: '6.5rem' }}
                >
                  {unitsDigit}
                </motion.div>
              </div>

              {/* Energy beam between digits */}
              <div className="absolute left-[30%] right-[30%] top-1/2 h-1 -translate-y-1/2 energy-beam rounded-full opacity-40" />
            </div>

            {/* Hint formula */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 px-4 py-2 rounded-full bg-accent-light/40 border border-accent/40 text-sm font-extrabold text-ink flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-accent-dark" />
              <span>Add: {tensDigit} + {unitsDigit} = ?</span>
            </motion.div>

            {/* Number Pad */}
            {stage === 'input' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 w-full"
              >
                <NumberPad
                  value={middleDigit}
                  onChange={(v) => { setIsError(false); setMiddleDigit(v); }}
                  onSubmit={handleVerify}
                  maxLength={2}
                  submitLabel="Verify Sum"
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── SOLVED: Show the magic result ─── */}
        {stage === 'solved' && (
          <motion.div
            key="solved"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-dramatic border-2 border-success/40 flex flex-col items-center"
          >
            {/* Success burst background */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.3 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-gradient-to-r from-success-light via-accent-light to-primary-light rounded-5xl blur-2xl pointer-events-none -z-10"
            />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-success flex items-center justify-center text-white text-3xl shadow-glow-success mb-4"
            >
              ✨
            </motion.div>

            <h4 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mb-2">
              43 × 11 = <span className="text-primary-dark">4</span>
              <span className="text-accent-dark">{correctSum}</span>
              <span className="text-secondary-dark">3</span>
            </h4>

            <p className="text-sm font-bold text-ink-muted mb-6 text-center max-w-sm">
              The digits split, the sum slides in, and you have the answer in under 2 seconds! 🚀
            </p>

            {/* Merged number animation */}
            <div className="flex items-center gap-1 mb-8">
              {[tensDigit, correctSum, unitsDigit].map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl font-heading font-extrabold text-4xl sm:text-5xl flex items-center justify-center shadow-float border-4 border-white/50 select-none ${
                    i === 1
                      ? 'bg-gradient-to-b from-accent to-accent-dark text-ink'
                      : i === 0
                      ? 'bg-gradient-to-b from-primary to-primary-dark text-white'
                      : 'bg-gradient-to-b from-secondary to-secondary-dark text-white'
                  }`}
                >
                  {d}
                </motion.div>
              ))}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleStartPractice}
              className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-ink font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
            >
              <Zap className="w-5 h-5" /> Enter Lightning Round (3 Problems)
            </motion.button>
          </motion.div>
        )}

        {/* ─── PRACTICE: Lightning round problems ─── */}
        {stage === 'practice' && practiceProblems[practiceIndex] && (
          <motion.div
            key={`practice-${practiceIndex}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-accent/40 flex flex-col items-center"
          >
            {/* Problem counter */}
            <div className="flex items-center gap-3 mb-4">
              {practiceProblems.map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-2 rounded-full transition-all ${
                    i < practiceIndex ? 'bg-success' :
                    i === practiceIndex ? 'bg-primary w-12' :
                    'bg-secondary-light/40'
                  }`}
                />
              ))}
            </div>

            {/* Problem display */}
            <div className="w-full h-40 bg-gradient-to-br from-bg-blue to-bg-lavender rounded-4xl border-2 border-primary/20 flex items-center justify-center shadow-inner mb-6">
              <motion.div
                key={practiceIndex}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="font-heading font-extrabold text-4xl sm:text-5xl text-ink"
              >
                {practiceProblems[practiceIndex].tens}{practiceProblems[practiceIndex].units} × 11 = ?
              </motion.div>
            </div>

            <NumberPad
              value={practiceAnswer}
              onChange={(v) => setPracticeAnswer(v)}
              onSubmit={handlePracticeSubmit}
              maxLength={4}
              submitLabel="Submit Answer"
            />
          </motion.div>
        )}

        {/* ─── COMPLETE: Star rating & continue ─── */}
        {stage === 'complete' && (
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
              🏆
            </motion.div>

            <h4 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mb-2">
              Lightning Round Complete!
            </h4>

            <p className="text-sm font-bold text-ink-muted mb-4">
              {practiceCorrect}/{practiceProblems.length} correct • {practiceErrors} mistake{practiceErrors !== 1 ? 's' : ''}
            </p>

            <StarRating stars={getStars()} size={56} className="mb-6" />

            <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-6">
              {practiceProblems.map((p, i) => (
                <div key={i} className="p-3 rounded-2xl bg-bg-blue border border-primary/20 text-center">
                  <div className="text-xs font-bold text-ink-muted">{p.tens}{p.units} × 11</div>
                  <div className="font-heading font-extrabold text-lg text-primary-dark">{p.answer}</div>
                </div>
              ))}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-success to-success-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
            >
              <CheckCircle2 className="w-5 h-5" /> Simulation Complete — Continue
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
