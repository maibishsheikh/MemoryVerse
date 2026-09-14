'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface CountdownRingProps {
  totalSeconds: number;
  remainingSeconds: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function CountdownRing({
  totalSeconds,
  remainingSeconds,
  size = 100,
  strokeWidth = 8,
  className = '',
}: CountdownRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, remainingSeconds / totalSeconds);
  const dashOffset = circumference * (1 - progress);

  // Color shifts from calm blue → orange → urgent red
  const getColor = () => {
    if (progress > 0.5) return '#6C9BD8'; // primary blue
    if (progress > 0.25) return '#FFC85C'; // accent yellow
    return '#FF8A80'; // error red
  };

  const getGlowColor = () => {
    if (progress > 0.5) return 'rgba(108, 155, 216, 0.3)';
    if (progress > 0.25) return 'rgba(255, 200, 92, 0.4)';
    return 'rgba(255, 138, 128, 0.5)';
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Glow backdrop */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 20px ${getGlowColor()}`,
            `0 0 35px ${getGlowColor()}`,
            `0 0 20px ${getGlowColor()}`,
          ],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full"
      />

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(210, 195, 238, 0.25)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${getGlowColor()})` }}
        />
      </svg>

      {/* Center time display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={remainingSeconds}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="font-heading font-extrabold text-ink"
          style={{ fontSize: size * 0.3 }}
        >
          {remainingSeconds}
        </motion.span>
        <span
          className="font-bold text-ink-muted uppercase tracking-wider"
          style={{ fontSize: size * 0.09 }}
        >
          sec
        </span>
      </div>
    </div>
  );
}
