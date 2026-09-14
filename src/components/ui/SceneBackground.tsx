'use client';

import React from 'react';
import { motion } from 'framer-motion';

type SceneType = 'classroom' | 'bedroom' | 'space' | 'garden' | 'ocean' | 'default';

interface SceneBackgroundProps {
  scene?: SceneType;
  children: React.ReactNode;
  className?: string;
  intensity?: 'soft' | 'vivid';
}

const SCENE_CONFIGS: Record<SceneType, {
  gradient: string;
  particles: { emoji: string; count: number }[];
  overlayOpacity: number;
}> = {
  classroom: {
    gradient: 'from-amber-50 via-orange-50/60 to-yellow-50',
    particles: [
      { emoji: '📐', count: 3 },
      { emoji: '✏️', count: 2 },
      { emoji: '📖', count: 2 },
    ],
    overlayOpacity: 0.04,
  },
  bedroom: {
    gradient: 'from-indigo-50 via-purple-50/60 to-blue-50',
    particles: [
      { emoji: '⭐', count: 4 },
      { emoji: '🌙', count: 2 },
      { emoji: '✨', count: 3 },
    ],
    overlayOpacity: 0.05,
  },
  space: {
    gradient: 'from-slate-900 via-indigo-950/90 to-purple-950',
    particles: [
      { emoji: '⭐', count: 6 },
      { emoji: '🌟', count: 3 },
      { emoji: '💫', count: 2 },
    ],
    overlayOpacity: 0.08,
  },
  garden: {
    gradient: 'from-green-50 via-emerald-50/60 to-lime-50',
    particles: [
      { emoji: '🌸', count: 3 },
      { emoji: '🦋', count: 2 },
      { emoji: '🍃', count: 3 },
    ],
    overlayOpacity: 0.04,
  },
  ocean: {
    gradient: 'from-cyan-50 via-sky-50/60 to-blue-50',
    particles: [
      { emoji: '🐚', count: 2 },
      { emoji: '🌊', count: 2 },
      { emoji: '⚓', count: 1 },
    ],
    overlayOpacity: 0.04,
  },
  default: {
    gradient: 'from-bg-lavender via-white to-bg-blue',
    particles: [
      { emoji: '✨', count: 3 },
      { emoji: '💡', count: 2 },
    ],
    overlayOpacity: 0.03,
  },
};

// Deterministic positions from seed
function getParticlePositions(scene: SceneType) {
  const config = SCENE_CONFIGS[scene];
  const positions: { emoji: string; x: number; y: number; delay: number; duration: number; size: number }[] = [];
  let seed = 0;

  config.particles.forEach((particleGroup) => {
    for (let i = 0; i < particleGroup.count; i++) {
      seed += 1;
      positions.push({
        emoji: particleGroup.emoji,
        x: ((seed * 37 + 13) % 90) + 5,
        y: ((seed * 53 + 7) % 80) + 5,
        delay: (seed * 0.7) % 4,
        duration: 3 + ((seed * 17) % 4),
        size: 14 + ((seed * 11) % 12),
      });
    }
  });

  return positions;
}

export default function SceneBackground({
  scene = 'default',
  children,
  className = '',
  intensity = 'soft',
}: SceneBackgroundProps) {
  const config = SCENE_CONFIGS[scene];
  const particles = getParticlePositions(scene);
  const isVivid = intensity === 'vivid';
  const isDarkScene = scene === 'space';

  return (
    <div
      className={`relative overflow-hidden rounded-4xl sm:rounded-5xl ${className}`}
    >
      {/* Base gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} ${
          isDarkScene ? '' : 'opacity-90'
        }`}
      />

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isDarkScene
            ? 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)'
            : `radial-gradient(rgba(46, 42, 74, ${config.overlayOpacity}) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Floating particles */}
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            opacity: isVivid ? 0.4 : 0.2,
          }}
          animate={{
            y: [-8, 8, -8],
            x: [-4, 4, -4],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
