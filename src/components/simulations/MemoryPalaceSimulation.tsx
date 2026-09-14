'use client';

import React, { useState, useCallback } from 'react';
import { SimulationConfig } from '@/types/lesson';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Navigation, RotateCcw, Eye, EyeOff, Lock } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';
import StarRating from '../ui/StarRating';

interface MemoryPalaceSimulationProps {
  config: SimulationConfig;
  onComplete: () => void;
}

interface PalaceLocus {
  id: string;
  name: string;
  icon: string;
  coords: { x: number; y: number };
  targetObject: { id: string; name: string; icon: string };
  color: string;
}

const LOCI: PalaceLocus[] = [
  { id: 'door', name: 'Front Door', icon: '🚪', coords: { x: 15, y: 75 }, targetObject: { id: 'key', name: 'Golden Key', icon: '🔑' }, color: '#FF8A80' },
  { id: 'bed', name: 'Cozy Bed', icon: '🛏️', coords: { x: 22, y: 28 }, targetObject: { id: 'robot', name: 'Dancing Robot', icon: '🤖' }, color: '#6C9BD8' },
  { id: 'desk', name: 'Study Desk', icon: '🖥️', coords: { x: 55, y: 20 }, targetObject: { id: 'telescope', name: 'Star Telescope', icon: '🔭' }, color: '#B79FE0' },
  { id: 'bookshelf', name: 'Bookshelf', icon: '📚', coords: { x: 82, y: 30 }, targetObject: { id: 'crystal', name: 'Magic Crystal', icon: '💎' }, color: '#7BC9A0' },
  { id: 'window', name: 'Sunny Window', icon: '🪟', coords: { x: 82, y: 75 }, targetObject: { id: 'kite', name: 'Rainbow Kite', icon: '🪁' }, color: '#FFC85C' },
];

export default function MemoryPalaceSimulation({
  config,
  onComplete,
}: MemoryPalaceSimulationProps) {
  const [phase, setPhase] = useState<'place' | 'nightwalk' | 'recall' | 'complete'>('place');
  const [placedObjects, setPlacedObjects] = useState<Record<string, string>>({});
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [walkIndex, setWalkIndex] = useState(0);
  const [recallOrder, setRecallOrder] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakeLocusId, setShakeLocusId] = useState<string | null>(null);

  const inventory = LOCI.map((l) => l.targetObject);
  const unplacedObjects = inventory.filter(
    (obj) => !Object.values(placedObjects).includes(obj.id)
  );
  const allPlaced = Object.keys(placedObjects).length === LOCI.length;

  // ─── Placement Phase ───
  const handleSelectObject = useCallback((id: string) => {
    soundFx.playPop();
    setSelectedObjectId(id);
  }, []);

  const handlePlaceAtLocus = useCallback((locusId: string) => {
    if (!selectedObjectId) return;
    const locus = LOCI.find((l) => l.id === locusId);
    if (!locus) return;

    if (locus.targetObject.id === selectedObjectId) {
      soundFx.playSuccess();
      setPlacedObjects((prev) => ({ ...prev, [locusId]: selectedObjectId }));
      setSelectedObjectId(null);
    } else {
      soundFx.playGentleError();
      setShakeLocusId(locusId);
      setTimeout(() => setShakeLocusId(null), 600);
    }
  }, [selectedObjectId]);

  // ─── Night Walk Phase ───
  const handleStartNightWalk = useCallback(() => {
    soundFx.playPop();
    setWalkIndex(0);
    setPhase('nightwalk');
  }, []);

  const handleNextWalkStep = useCallback(() => {
    soundFx.playPop();
    if (walkIndex < LOCI.length - 1) {
      setWalkIndex(walkIndex + 1);
    } else {
      soundFx.playSuccess();
      setPhase('recall');
    }
  }, [walkIndex]);

  // ─── Recall Phase ───
  const handleRecallTap = useCallback((locusId: string) => {
    const expectedLocus = LOCI[recallOrder.length];
    if (!expectedLocus) return;

    if (locusId === expectedLocus.id) {
      soundFx.playSuccess();
      setRecallOrder((prev) => [...prev, locusId]);
      if (recallOrder.length + 1 === LOCI.length) {
        setPhase('complete');
      }
    } else {
      soundFx.playGentleError();
      setWrongAttempts((w) => w + 1);
      setShakeLocusId(locusId);
      setTimeout(() => setShakeLocusId(null), 600);
    }
  }, [recallOrder]);

  const getStars = (): 1 | 2 | 3 => {
    if (wrongAttempts === 0) return 3;
    if (wrongAttempts <= 2) return 2;
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
          <Navigation className="w-3.5 h-3.5 text-accent-dark" /> Memory Palace Simulator
        </span>
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-3">
          {phase === 'place' && 'Place Items in Your Bedroom Palace'}
          {phase === 'nightwalk' && `🌙 Night Walk — Station ${walkIndex + 1}: ${LOCI[walkIndex].name}`}
          {phase === 'recall' && '🧠 Recall Challenge — Tap Stations in Order!'}
          {phase === 'complete' && '🏆 Palace Walk Complete!'}
        </h3>
        <p className="text-sm font-bold text-ink-muted mt-1 max-w-lg mx-auto">
          {phase === 'place' && 'Select an item below, then tap its matching room landmark to lock it in!'}
          {phase === 'nightwalk' && 'The room dims… walk through your palace and memorize each station.'}
          {phase === 'recall' && `Tap the stations in the correct order. (${recallOrder.length}/${LOCI.length})`}
          {phase === 'complete' && 'You navigated your memory palace perfectly!'}
        </p>
      </motion.div>

      {/* ─── Room Canvas ─── */}
      <div className={`relative w-full h-80 sm:h-96 rounded-4xl border-2 overflow-hidden shadow-card transition-all duration-700 ${
        phase === 'nightwalk'
          ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-indigo-800/50'
          : 'bg-gradient-to-tr from-bg-lavender via-bg-blue to-bg border-secondary-light/60'
      }`}>
        {/* Room grid */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            backgroundImage: phase === 'nightwalk'
              ? 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)'
              : 'radial-gradient(rgba(183,159,224,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Room border dashed */}
        <div className={`absolute inset-4 rounded-3xl border-2 border-dashed pointer-events-none transition-colors duration-700 ${
          phase === 'nightwalk' ? 'border-white/10' : 'border-secondary-light/40'
        }`} />

        {/* Night overlay with spotlight */}
        {phase === 'nightwalk' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: `radial-gradient(circle 80px at ${LOCI[walkIndex].coords.x}% ${LOCI[walkIndex].coords.y}%, transparent 0%, rgba(15,12,41,0.85) 100%)`,
              transition: 'background 0.6s ease-in-out',
            }}
          />
        )}

        {/* Loci stations */}
        {LOCI.map((locus, idx) => {
          const isCurrentWalk = phase === 'nightwalk' && walkIndex === idx;
          const placedObjId = placedObjects[locus.id];
          const placedObj = inventory.find((o) => o.id === placedObjId);
          const isRecalled = recallOrder.includes(locus.id);
          const isNextRecall = phase === 'recall' && recallOrder.length === idx;
          const isShaking = shakeLocusId === locus.id;

          return (
            <motion.div
              key={locus.id}
              onClick={() => {
                if (phase === 'place') handlePlaceAtLocus(locus.id);
                if (phase === 'recall' && !isRecalled) handleRecallTap(locus.id);
              }}
              style={{
                left: `${locus.coords.x}%`,
                top: `${locus.coords.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={isShaking ? { x: [-6, 6, -4, 4, 0] } : {}}
              transition={isShaking ? { duration: 0.4 } : {}}
              className={`absolute cursor-pointer rounded-3xl p-3 sm:p-4 flex flex-col items-center gap-1 transition-all duration-300 ${
                isCurrentWalk
                  ? 'bg-white text-ink scale-125 shadow-lg z-30 border-2 border-accent glow-pulse-accent'
                  : isRecalled
                  ? 'bg-success/90 text-white scale-105 shadow-glow-success z-20 border-2 border-white/50'
                  : placedObj
                  ? 'bg-white border-2 border-success/60 shadow-md z-20'
                  : selectedObjectId && phase === 'place'
                  ? 'bg-white/90 border-2 border-primary border-dashed shadow-float glow-pulse z-20 hover:scale-110'
                  : isNextRecall
                  ? 'bg-white/90 border-2 border-accent/60 shadow-float glow-pulse-accent z-20 hover:scale-110'
                  : phase === 'nightwalk'
                  ? 'bg-white/10 border border-white/10 z-10'
                  : 'bg-white/80 border border-secondary-light/60 shadow-sm hover:bg-white z-10'
              }`}
            >
              <div className="text-2xl sm:text-3xl">{locus.icon}</div>
              <div className={`text-[10px] sm:text-xs font-extrabold whitespace-nowrap ${
                phase === 'nightwalk' && !isCurrentWalk ? 'text-white/30' : 'text-ink'
              }`}>
                {idx + 1}. {locus.name}
              </div>

              {/* Placed object badge */}
              {placedObj && phase !== 'nightwalk' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="text-xs font-extrabold text-success-dark bg-success-light/30 px-2 py-0.5 rounded-full flex items-center gap-1 mt-0.5 shadow-sm snap-place"
                >
                  <span>{placedObj.icon}</span> {placedObj.name}
                </motion.div>
              )}

              {/* Night walk reveal */}
              {isCurrentWalk && placedObj && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 px-3 py-1 rounded-full bg-accent text-ink text-xs font-extrabold shadow-glow-accent"
                >
                  {placedObj.icon} {placedObj.name}
                </motion.div>
              )}

              {/* Recall order number */}
              {isRecalled && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-success text-white text-xs font-extrabold flex items-center justify-center shadow-sm"
                >
                  {recallOrder.indexOf(locus.id) + 1}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ─── Bottom Controls ─── */}
      <AnimatePresence mode="wait">
        {/* Placement inventory */}
        {phase === 'place' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 space-y-4"
          >
            <div className="flex items-center justify-between text-xs font-bold text-ink-muted px-1">
              <span className="uppercase tracking-wider">Memory Objects ({unplacedObjects.length} left)</span>
              <span>Tap item → tap station</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {inventory.map((obj) => {
                const isPlaced = Object.values(placedObjects).includes(obj.id);
                const isSelected = selectedObjectId === obj.id;

                return (
                  <motion.button
                    key={obj.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !isPlaced && handleSelectObject(obj.id)}
                    disabled={isPlaced}
                    className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                      isPlaced
                        ? 'border-success/30 bg-success-light/20 opacity-40 cursor-default'
                        : isSelected
                        ? 'border-primary bg-primary text-white shadow-float scale-105 glow-pulse'
                        : 'border-secondary-light/60 bg-white hover:bg-bg-lavender text-ink shadow-sm hover:shadow-md'
                    }`}
                  >
                    <motion.span
                      className="text-2xl"
                      animate={!isPlaced && !isSelected ? { y: [0, -3, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {obj.icon}
                    </motion.span>
                    <span className="text-xs font-bold truncate max-w-full">
                      {obj.name}
                    </span>
                    {isPlaced && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {allPlaced && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  type="button"
                  onClick={handleStartNightWalk}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
                >
                  <EyeOff className="w-5 h-5" /> Begin Night Walk 🌙
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Night walk controls */}
        {phase === 'nightwalk' && (
          <motion.div
            key="nightwalk"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 flex flex-col items-center gap-4"
          >
            <div className="p-4 rounded-3xl bg-indigo-950/80 border border-indigo-700/40 text-center max-w-md backdrop-blur-sm">
              <span className="text-xs font-bold text-indigo-300 uppercase block">
                Station #{walkIndex + 1}
              </span>
              <h4 className="font-heading font-extrabold text-xl text-white mt-1">
                {LOCI[walkIndex].targetObject.icon} {LOCI[walkIndex].targetObject.name}
              </h4>
              <p className="text-xs text-indigo-200 mt-1">
                at the {LOCI[walkIndex].name} {LOCI[walkIndex].icon}
              </p>
            </div>

            {/* Walk progress */}
            <div className="flex items-center gap-2">
              {LOCI.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i <= walkIndex ? 'w-8 bg-accent' : 'w-3 bg-white/20'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextWalkStep}
              className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-ink font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
            >
              {walkIndex === LOCI.length - 1 ? (
                <><Eye className="w-5 h-5" /> Start Recall Challenge</>
              ) : (
                <>Walk to Station #{walkIndex + 2} →</>
              )}
            </button>
          </motion.div>
        )}

        {/* Recall instructions */}
        {phase === 'recall' && (
          <motion.div
            key="recall"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <p className="text-sm font-bold text-ink-muted">
              Tap the room stations in the correct walking order! ({recallOrder.length}/{LOCI.length})
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              {LOCI.map((l, i) => (
                <div
                  key={l.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold transition-all ${
                    i < recallOrder.length
                      ? 'bg-success text-white shadow-sm'
                      : 'bg-secondary-light/30 text-ink-muted/40'
                  }`}
                >
                  {i < recallOrder.length ? '✓' : i + 1}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Complete */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center gap-4"
          >
            <StarRating stars={getStars()} size={52} />

            <p className="text-sm font-bold text-ink-muted">
              {wrongAttempts === 0 ? 'Perfect recall! No mistakes!' : `${wrongAttempts} wrong tap${wrongAttempts > 1 ? 's' : ''} — great effort!`}
            </p>

            <button
              type="button"
              onClick={onComplete}
              className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-success to-success-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
            >
              <CheckCircle2 className="w-5 h-5" /> Palace Walk Complete!
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
