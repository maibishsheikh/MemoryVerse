'use client';

import React, { useState } from 'react';
import { SimulationConfig } from '@/types/lesson';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Navigation, RotateCcw } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

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
}

const LOCI: PalaceLocus[] = [
  { id: 'door', name: 'Front Door', icon: '🚪', coords: { x: 18, y: 78 }, targetObject: { id: 'key', name: 'Golden Key', icon: '🔑' } },
  { id: 'bed', name: 'Cozy Bed', icon: '🛏️', coords: { x: 22, y: 25 }, targetObject: { id: 'robot', name: 'Dancing Robot', icon: '🤖' } },
  { id: 'desk', name: 'Study Desk', icon: '🖥️', coords: { x: 55, y: 25 }, targetObject: { id: 'telescope', name: 'Star Telescope', icon: '🔭' } },
  { id: 'bookshelf', name: 'Bookshelf', icon: '📚', coords: { x: 80, y: 35 }, targetObject: { id: 'crystal', name: 'Magic Crystal', icon: '💎' } },
  { id: 'window', name: 'Sunny Window', icon: '🪟', coords: { x: 80, y: 78 }, targetObject: { id: 'kite', name: 'Rainbow Kite', icon: '🪁' } },
];

export default function MemoryPalaceSimulation({
  config,
  onComplete,
}: MemoryPalaceSimulationProps) {
  const [placedObjects, setPlacedObjects] = useState<Record<string, string>>({}); // locusId -> objectId
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [walkthroughIndex, setWalkthroughIndex] = useState<number | null>(null);

  const inventory = LOCI.map((l) => l.targetObject);
  const unplacedObjects = inventory.filter(
    (obj) => !Object.values(placedObjects).includes(obj.id)
  );

  const allPlaced = Object.keys(placedObjects).length === LOCI.length;

  const handleSelectObject = (id: string) => {
    soundFx.playPop();
    setSelectedObjectId(id);
  };

  const handlePlaceAtLocus = (locusId: string) => {
    if (!selectedObjectId) return;
    const locus = LOCI.find((l) => l.id === locusId);
    if (!locus) return;

    if (locus.targetObject.id === selectedObjectId) {
      soundFx.playSuccess();
      setPlacedObjects((prev) => ({ ...prev, [locusId]: selectedObjectId }));
      setSelectedObjectId(null);
    } else {
      soundFx.playGentleError();
    }
  };

  const handleStartWalkthrough = () => {
    soundFx.playPop();
    setWalkthroughIndex(0);
  };

  const handleNextWalkStep = () => {
    soundFx.playPop();
    if (walkthroughIndex !== null && walkthroughIndex < LOCI.length - 1) {
      setWalkthroughIndex(walkthroughIndex + 1);
    } else {
      soundFx.playSuccess();
      onComplete();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-4 bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-accent-light text-ink">
          Interactive Palace Simulator
        </span>
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-2">
          {walkthroughIndex === null
            ? 'Place Items in Your Bedroom Palace'
            : `Walking Station ${walkthroughIndex + 1}: ${LOCI[walkthroughIndex].name}`}
        </h3>
        <p className="text-sm font-bold text-ink-muted mt-1">
          {walkthroughIndex === null
            ? 'Select an item below, then tap the right room landmark to lock it into your spatial memory!'
            : 'Walk through your palace in order to recall every item from your mind.'}
        </p>
      </div>

      {/* Interactive Room Canvas (Isometric/Floorplan style) */}
      <div className="relative w-full h-80 sm:h-96 bg-gradient-to-tr from-bg-lavender via-bg-blue to-bg rounded-4xl border-2 border-secondary-light shadow-inner overflow-hidden p-4">
        {/* Room Floor Grid & Wall Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(#B79FE0_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        <div className="absolute inset-4 rounded-3xl border-2 border-dashed border-secondary-light/60 pointer-events-none" />

        {/* Loci Stations */}
        {LOCI.map((locus, idx) => {
          const isCurrentWalkLocus = walkthroughIndex === idx;
          const placedObjId = placedObjects[locus.id];
          const placedObj = inventory.find((o) => o.id === placedObjId);

          return (
            <div
              key={locus.id}
              onClick={() => handlePlaceAtLocus(locus.id)}
              style={{
                left: `${locus.coords.x}%`,
                top: `${locus.coords.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer rounded-3xl p-3 sm:p-4 flex flex-col items-center gap-1 transition-all ${
                isCurrentWalkLocus
                  ? 'bg-accent text-ink scale-125 shadow-glow-accent z-30 border-2 border-white animate-bounce-soft'
                  : placedObj
                  ? 'bg-white border-2 border-success shadow-md z-20'
                  : selectedObjectId
                  ? 'bg-white border-2 border-primary border-dashed shadow-float animate-pulse-subtle hover:scale-110 z-20'
                  : 'bg-white/80 border border-secondary-light shadow-sm hover:bg-white z-10'
              }`}
            >
              <div className="text-2xl sm:text-3xl">{locus.icon}</div>
              <div className="text-[11px] sm:text-xs font-extrabold text-ink whitespace-nowrap">
                {idx + 1}. {locus.name}
              </div>

              {placedObj && (
                <div className="text-xs font-extrabold text-success-dark bg-success-light/30 px-2 py-0.5 rounded-full flex items-center gap-1 mt-0.5 shadow-sm">
                  <span>{placedObj.icon}</span> {placedObj.name}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Walkthrough Controls / Inventory Drawer */}
      {walkthroughIndex === null ? (
        <div className="w-full mt-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted px-2">
            <span>UNPLACED MEMORY OBJECTS ({unplacedObjects.length} left)</span>
            <span>Tap an object, then tap its room station</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {inventory.map((obj) => {
              const isPlaced = Object.values(placedObjects).includes(obj.id);
              const isSelected = selectedObjectId === obj.id;

              return (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => !isPlaced && handleSelectObject(obj.id)}
                  disabled={isPlaced}
                  className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1 ${
                    isPlaced
                      ? 'border-success/30 bg-success-light/20 opacity-50 cursor-default'
                      : isSelected
                      ? 'border-primary bg-primary text-white shadow-float scale-105'
                      : 'border-secondary-light bg-white hover:bg-bg-lavender text-ink'
                  }`}
                >
                  <span className="text-2xl">{obj.icon}</span>
                  <span className="text-xs font-bold truncate max-w-full">
                    {obj.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center pt-2">
            {allPlaced && (
              <button
                type="button"
                onClick={handleStartWalkthrough}
                className="w-full max-w-md py-4 rounded-full bg-accent text-ink font-heading font-extrabold text-lg shadow-float hover:bg-accent-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
              >
                <Navigation className="w-5 h-5" /> Start Memory Palace Walkthrough
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full mt-6 flex flex-col items-center gap-4">
          <div className="p-4 rounded-3xl bg-bg-blue border border-primary/40 text-center max-w-md">
            <span className="text-xs font-bold text-ink-muted uppercase block">
              Locus #{walkthroughIndex + 1}
            </span>
            <h4 className="font-heading font-extrabold text-xl text-ink">
              {LOCI[walkthroughIndex].targetObject.icon} {LOCI[walkthroughIndex].targetObject.name} at the {LOCI[walkthroughIndex].name}
            </h4>
          </div>

          <button
            type="button"
            onClick={handleNextWalkStep}
            className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-primary to-success text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
          >
            {walkthroughIndex === LOCI.length - 1 ? (
              <>
                <CheckCircle2 className="w-5 h-5" /> Palace Walk Complete! Let's Practice
              </>
            ) : (
              <>
                Walk to Station #{walkthroughIndex + 2} ({LOCI[walkthroughIndex + 1].name})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
