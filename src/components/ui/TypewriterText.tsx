'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  className?: string;
  onComplete?: () => void;
  skipEnabled?: boolean;
}

export default function TypewriterText({
  text,
  speed = 35,
  className = '',
  onComplete,
  skipEnabled = true,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setCharIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (charIndex >= text.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText((prev) => prev + text[charIndex]);
      setCharIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, text, speed, onComplete]);

  const handleSkip = useCallback(() => {
    if (skipEnabled && !isComplete) {
      setDisplayedText(text);
      setCharIndex(text.length);
      setIsComplete(true);
      onComplete?.();
    }
  }, [skipEnabled, isComplete, text, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative ${className}`}
      onClick={handleSkip}
    >
      <span className="text-ink">{displayedText}</span>
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-0.5 h-[1.1em] bg-primary ml-0.5 align-text-bottom"
        />
      )}
      {skipEnabled && !isComplete && (
        <div className="absolute -bottom-6 right-0 text-[10px] font-bold text-ink-muted/50 uppercase tracking-widest">
          tap to skip
        </div>
      )}
    </motion.div>
  );
}
