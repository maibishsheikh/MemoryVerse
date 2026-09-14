'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

interface FeedbackToastProps {
  visible: boolean;
  isCorrect: boolean;
  message: string;
  onNext: () => void;
}

export default function FeedbackToast({
  visible,
  isCorrect,
  message,
  onNext,
}: FeedbackToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl rounded-4xl p-4 sm:p-5 shadow-float border-2 flex items-center justify-between gap-4 ${
            isCorrect
              ? 'bg-white border-success text-ink'
              : 'bg-white border-attention text-ink'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isCorrect ? 'bg-success-light text-success-dark' : 'bg-attention-light text-attention-dark'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <RotateCcw className="w-6 h-6 animate-spin" />
              )}
            </div>
            <div>
              <h4 className="font-heading font-bold text-base sm:text-lg">
                {isCorrect ? '🌟 Brilliant!' : 'Almost There!'}
              </h4>
              <p className="text-xs sm:text-sm font-bold text-ink-muted">
                {message}
              </p>
            </div>
          </div>

          <button
            onClick={onNext}
            className={`px-6 py-3 rounded-full font-extrabold text-sm shadow-sm flex items-center gap-2 shrink-0 btn-bouncy ${
              isCorrect
                ? 'bg-success text-white hover:bg-success-dark'
                : 'bg-attention text-ink hover:bg-attention-dark'
            }`}
          >
            <span>{isCorrect ? 'Continue' : 'Got It'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
