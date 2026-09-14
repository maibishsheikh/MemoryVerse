'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface XPCounterProps {
  targetXP: number;
  duration?: number; // ms for the full count-up
  className?: string;
  onComplete?: () => void;
}

export default function XPCounter({
  targetXP,
  duration = 1800,
  className = '',
  onComplete,
}: XPCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a satisfying deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(easedProgress * targetXP);

      setDisplayValue(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetXP, duration, onComplete]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <motion.div
        animate={{
          rotate: [0, 15, -15, 10, -10, 0],
        }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Sparkles className="w-8 h-8 text-accent-dark fill-accent" />
      </motion.div>

      <div className="flex items-baseline gap-1">
        <span className="font-heading font-extrabold text-4xl sm:text-5xl text-primary-dark tabular-nums">
          +{displayValue}
        </span>
        <span className="font-heading font-extrabold text-lg text-accent-dark uppercase">
          XP
        </span>
      </div>

      {/* Sparkle ring effect when counting */}
      {displayValue < targetXP && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="absolute w-20 h-20 rounded-full bg-accent/10 -z-10"
        />
      )}
    </motion.div>
  );
}
