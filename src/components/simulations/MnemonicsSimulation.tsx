'use client';

import React, { useState, useCallback } from 'react';
import { SimulationConfig } from '@/types/lesson';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, RotateCcw, Orbit } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';
import StarRating from '../ui/StarRating';

interface MnemonicsSimulationProps {
  config: SimulationConfig;
  onComplete: () => void;
}

const PLANETS = [
  { id: '1', letter: 'M', word: 'My', planet: 'Mercury', emoji: '☿️', color: '#9CA3AF', size: 28, orbitRadius: 55 },
  { id: '2', letter: 'V', word: 'Very', planet: 'Venus', emoji: '♀️', color: '#FFC85C', size: 32, orbitRadius: 75 },
  { id: '3', letter: 'E', word: 'Educated', planet: 'Earth', emoji: '🌍', color: '#6C9BD8', size: 34, orbitRadius: 95 },
  { id: '4', letter: 'M', word: 'Mother', planet: 'Mars', emoji: '♂️', color: '#FF8A80', size: 30, orbitRadius: 115 },
  { id: '5', letter: 'J', word: 'Just', planet: 'Jupiter', emoji: '♃', color: '#E8935A', size: 44, orbitRadius: 140 },
  { id: '6', letter: 'S', word: 'Served', planet: 'Saturn', emoji: '♄', color: '#FFDA8F', size: 40, orbitRadius: 165 },
  { id: '7', letter: 'U', word: 'Us', planet: 'Uranus', emoji: '♅', color: '#7BC9A0', size: 36, orbitRadius: 188 },
  { id: '8', letter: 'N', word: 'Nachos', planet: 'Neptune', emoji: '♆', color: '#4E7FBE', size: 36, orbitRadius: 210 },
];

export default function MnemonicsSimulation({
  config,
  onComplete,
}: MnemonicsSimulationProps) {
  const [phase, setPhase] = useState<'build' | 'scramble' | 'complete'>('build');
  const [connectedPlanets, setConnectedPlanets] = useState<string[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  // Scramble state
  const [scrambledWords, setScrambledWords] = useState<typeof PLANETS>([]);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [scrambleErrors, setScrambleErrors] = useState(0);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const currentPlanet = PLANETS[activeWordIndex];
  const allConnected = connectedPlanets.length === PLANETS.length;

  const handleConnectPlanet = useCallback(() => {
    soundFx.playSuccess();
    setConnectedPlanets((prev) => [...prev, currentPlanet.id]);
    if (activeWordIndex < PLANETS.length - 1) {
      setTimeout(() => setActiveWordIndex(activeWordIndex + 1), 300);
    }
  }, [activeWordIndex, currentPlanet]);

  const handleStartScramble = useCallback(() => {
    soundFx.playPop();
    const shuffled = [...PLANETS].sort(() => Math.random() - 0.5);
    setScrambledWords(shuffled);
    setSelectedOrder([]);
    setScrambleErrors(0);
    setPhase('scramble');
  }, []);

  const handleSelectScrambledWord = useCallback((id: string) => {
    const expectedPlanet = PLANETS[selectedOrder.length];
    if (!expectedPlanet) return;

    if (id === expectedPlanet.id) {
      soundFx.playSuccess();
      setSelectedOrder((prev) => [...prev, id]);
      if (selectedOrder.length + 1 === PLANETS.length) {
        setTimeout(() => setPhase('complete'), 500);
      }
    } else {
      soundFx.playGentleError();
      setScrambleErrors((e) => e + 1);
      setShakeId(id);
      setTimeout(() => setShakeId(null), 500);
    }
  }, [selectedOrder]);

  const getStars = (): 1 | 2 | 3 => {
    if (scrambleErrors === 0) return 3;
    if (scrambleErrors <= 2) return 2;
    return 1;
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full bg-accent-light/60 border border-accent/40 text-ink shadow-sm">
          <Orbit className="w-3.5 h-3.5 text-accent-dark" /> Solar System Builder
        </span>
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-3">
          {phase === 'build' && 'Build Your Mnemonic Solar System'}
          {phase === 'scramble' && '🧠 Rebuild the Orbit From Memory!'}
          {phase === 'complete' && '🏆 Solar System Mastered!'}
        </h3>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── BUILD Phase ─── */}
        {phase === 'build' && (
          <motion.div
            key="build"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-5xl p-6 sm:p-10 shadow-dramatic border-2 border-indigo-800/40 flex flex-col items-center overflow-hidden relative"
          >
            {/* Star field */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />

            {/* Solar System Visualization */}
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center mb-6">
              {/* Sun at center */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(255, 200, 92, 0.4)',
                    '0 0 60px rgba(255, 200, 92, 0.6)',
                    '0 0 30px rgba(255, 200, 92, 0.4)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 flex items-center justify-center z-20 shadow-lg"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              >
                <span className="text-2xl">☀️</span>
              </motion.div>

              {/* Orbit rings & planets */}
              {PLANETS.map((planet, idx) => {
                const isConnected = connectedPlanets.includes(planet.id);
                const isCurrent = activeWordIndex === idx && !isConnected;
                const maxOrbit = 210;
                const scale = Math.min(1, 200 / maxOrbit); // scale factor for container
                const radius = planet.orbitRadius * scale;

                return (
                  <React.Fragment key={planet.id}>
                    {/* Orbit ring */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        opacity: isConnected ? 0.3 : isCurrent ? 0.5 : 0.1,
                        scale: 1,
                      }}
                      transition={{ delay: idx * 0.05 }}
                      className="absolute rounded-full border"
                      style={{
                        width: `${radius * 2}px`,
                        height: `${radius * 2}px`,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        borderColor: isConnected ? planet.color : 'rgba(255,255,255,0.15)',
                        borderStyle: isConnected ? 'solid' : 'dashed',
                      }}
                    />

                    {/* Planet dot on orbit */}
                    {isConnected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className="absolute rounded-full flex items-center justify-center z-10 shadow-md font-extrabold text-white"
                        style={{
                          width: `${planet.size * scale}px`,
                          height: `${planet.size * scale}px`,
                          backgroundColor: planet.color,
                          // Position at top of orbit
                          left: `calc(50% + ${radius * Math.cos(-Math.PI / 2 + idx * 0.4)}px - ${(planet.size * scale) / 2}px)`,
                          top: `calc(50% + ${radius * Math.sin(-Math.PI / 2 + idx * 0.4)}px - ${(planet.size * scale) / 2}px)`,
                          fontSize: `${Math.max(8, planet.size * scale * 0.4)}px`,
                        }}
                        title={planet.planet}
                      >
                        {planet.emoji}
                      </motion.div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Current word-to-planet connection card */}
            {!allConnected && (
              <motion.div
                key={`card-${activeWordIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-4 sm:p-5 rounded-3xl border-2 bg-white/10 backdrop-blur-sm flex items-center justify-between gap-4 mb-4"
                style={{ borderColor: `${currentPlanet.color}60` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white shadow-md"
                    style={{ backgroundColor: currentPlanet.color }}
                  >
                    {currentPlanet.emoji}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-300 uppercase block">
                      Planet #{activeWordIndex + 1}
                    </span>
                    <span className="font-heading font-extrabold text-xl text-white">
                      {currentPlanet.planet}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-300 uppercase block">
                    Mnemonic Word
                  </span>
                  <span className="font-heading font-extrabold text-xl text-accent">
                    &quot;<span className="underline decoration-2">{currentPlanet.letter}</span>{currentPlanet.word.slice(1)}&quot;
                  </span>
                </div>
              </motion.div>
            )}

            {/* Sentence progress */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 mb-5">
              {PLANETS.map((p, idx) => {
                const isConn = connectedPlanets.includes(p.id);
                const isCurr = activeWordIndex === idx;
                return (
                  <motion.span
                    key={p.id}
                    animate={isCurr ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={`px-2 py-1 rounded-lg text-xs font-extrabold transition-all ${
                      isConn
                        ? 'bg-white/20 text-white'
                        : isCurr
                        ? 'bg-accent/30 text-accent border border-accent/50'
                        : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {isConn || isCurr ? p.word : '___'}
                  </motion.span>
                );
              })}
            </div>

            {/* Action */}
            {!allConnected ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleConnectPlanet}
                className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
              >
                <Sparkles className="w-5 h-5" /> Connect &quot;{currentPlanet.word}&quot; to {currentPlanet.planet}
              </motion.button>
            ) : (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartScramble}
                className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-ink font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
              >
                🔀 Scramble & Rebuild the Orbit!
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ─── SCRAMBLE Phase ─── */}
        {phase === 'scramble' && (
          <motion.div
            key="scramble"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-accent/40 flex flex-col items-center"
          >
            <p className="text-sm font-bold text-ink-muted mb-4 text-center max-w-md">
              Tap the mnemonic words in the correct order! Use your sentence: <span className="font-extrabold text-ink">&quot;My Very Educated Mother Just Served Us Nachos&quot;</span>
            </p>

            {/* Already selected (in order) */}
            <div className="flex items-center flex-wrap gap-2 mb-4 min-h-[44px] justify-center">
              {selectedOrder.map((id, idx) => {
                const p = PLANETS.find((pl) => pl.id === id)!;
                return (
                  <motion.div
                    key={id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 shadow-sm"
                    style={{
                      borderColor: p.color,
                      backgroundColor: `${p.color}15`,
                    }}
                  >
                    <span className="text-sm">{p.emoji}</span>
                    <span className="font-extrabold text-sm text-ink">{p.word}</span>
                    <span className="text-[10px] font-bold text-ink-muted">({p.planet})</span>
                  </motion.div>
                );
              })}
              {selectedOrder.length < PLANETS.length && (
                <div className="px-3 py-2 rounded-xl border-2 border-dashed border-secondary-light/40 text-sm font-bold text-ink-muted/40">
                  #{selectedOrder.length + 1}?
                </div>
              )}
            </div>

            {/* Scrambled word buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-6">
              {scrambledWords.map((p) => {
                const isSelected = selectedOrder.includes(p.id);
                const isShaking = shakeId === p.id;

                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    animate={isShaking ? { x: [-5, 5, -3, 3, 0] } : {}}
                    transition={isShaking ? { duration: 0.4 } : {}}
                    onClick={() => !isSelected && handleSelectScrambledWord(p.id)}
                    disabled={isSelected}
                    className={`p-3 rounded-2xl border-2 font-heading font-extrabold text-base transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-success/30 bg-success-light/10 opacity-30 cursor-default'
                        : 'border-secondary-light/60 bg-white hover:border-primary hover:shadow-md hover:scale-105 cursor-pointer text-ink'
                    }`}
                  >
                    <span className="text-lg">{p.emoji}</span>
                    <span>
                      <span className="text-accent-dark underline">{p.letter}</span>
                      {p.word.slice(1)}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="text-xs font-bold text-ink-muted">
              Progress: {selectedOrder.length}/{PLANETS.length} • Mistakes: {scrambleErrors}
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
              className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-4xl shadow-lg mb-4"
            >
              🪐
            </motion.div>

            <h4 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mb-2">
              Solar System Mastered!
            </h4>

            <p className="text-sm font-bold text-ink-muted mb-2 text-center max-w-sm">
              You memorized all 8 planets using a powerful mnemonic sentence!
            </p>

            <div className="px-4 py-2 rounded-full bg-bg-lavender border border-secondary-light/40 font-heading font-extrabold text-sm text-primary-dark mb-4">
              &quot;My Very Educated Mother Just Served Us Nachos&quot;
            </div>

            <StarRating stars={getStars()} size={52} className="mb-6" />

            {/* Planet summary */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-md mb-6">
              {PLANETS.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Number(p.id) * 0.08 }}
                  className="p-2 rounded-xl bg-bg-blue border border-primary/20 text-center"
                >
                  <div className="text-sm">{p.emoji}</div>
                  <div className="text-[10px] font-extrabold text-ink truncate">{p.planet}</div>
                  <div className="text-[9px] font-bold text-accent-dark">{p.word}</div>
                </motion.div>
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
