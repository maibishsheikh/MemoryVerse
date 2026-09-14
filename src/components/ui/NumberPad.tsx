'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Delete, Check } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  className?: string;
  submitLabel?: string;
  submitDisabled?: boolean;
}

export default function NumberPad({
  value,
  onChange,
  onSubmit,
  maxLength = 6,
  className = '',
  submitLabel = 'Check',
  submitDisabled = false,
}: NumberPadProps) {
  const handlePress = (digit: string) => {
    soundFx.playPop();
    if (value.length < maxLength) {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    soundFx.playPop();
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    soundFx.playPop();
    onChange('');
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className={`w-full max-w-xs mx-auto ${className}`}>
      {/* Display */}
      <div className="mb-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-bg-blue to-bg-lavender border-2 border-primary/30 min-h-[56px] flex items-center justify-center shadow-inner">
        <motion.span
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="font-heading font-extrabold text-3xl text-ink tracking-widest"
        >
          {value || (
            <span className="text-ink-muted/40 text-xl">type answer</span>
          )}
        </motion.span>
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-2">
        {keys.map((digit) => (
          <motion.button
            key={digit}
            type="button"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handlePress(digit)}
            className="h-14 rounded-2xl bg-white border-2 border-secondary-light/60 font-heading font-extrabold text-2xl text-ink shadow-sm hover:bg-bg-lavender hover:border-primary/40 active:bg-primary active:text-white active:border-primary transition-colors"
          >
            {digit}
          </motion.button>
        ))}

        {/* Bottom row: Clear / 0 / Backspace */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={handleClear}
          className="h-14 rounded-2xl bg-error-light/30 border-2 border-error/30 font-bold text-xs text-error-dark hover:bg-error-light/60 transition-colors uppercase tracking-wide"
        >
          Clear
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => handlePress('0')}
          className="h-14 rounded-2xl bg-white border-2 border-secondary-light/60 font-heading font-extrabold text-2xl text-ink shadow-sm hover:bg-bg-lavender hover:border-primary/40 active:bg-primary active:text-white transition-colors"
        >
          0
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={handleBackspace}
          className="h-14 rounded-2xl bg-accent-light/40 border-2 border-accent/40 flex items-center justify-center text-ink hover:bg-accent-light/70 transition-colors"
        >
          <Delete className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Submit Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          soundFx.playPop();
          onSubmit();
        }}
        disabled={submitDisabled || !value}
        className="w-full mt-3 py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 btn-bouncy"
      >
        <Check className="w-5 h-5" /> {submitLabel}
      </motion.button>
    </div>
  );
}
