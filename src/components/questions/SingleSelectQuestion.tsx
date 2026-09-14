'use client';

import React, { useState } from 'react';
import { Question } from '@/types/lesson';
import { Check, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface SingleSelectQuestionProps {
  question: Question;
  onSubmit: (answer: string) => void;
  isSubmitting?: boolean;
}

export default function SingleSelectQuestion({
  question,
  onSubmit,
  isSubmitting,
}: SingleSelectQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    soundFx.playPop();
    setSelectedId(id);
  };

  const handleSubmit = () => {
    if (selectedId) {
      onSubmit(selectedId);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
      <div className="w-full text-center">
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight mb-2">
          {question.prompt}
        </h3>
        <p className="text-xs font-bold text-ink-muted">
          Choose the best matching answer
        </p>
      </div>

      <div className="w-full space-y-3">
        {question.options?.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={isSubmitting}
              className={`w-full min-h-[64px] p-4 sm:p-5 rounded-3xl border-2 text-left flex items-center justify-between gap-4 transition-all ${
                isSelected
                  ? 'bg-bg-blue border-primary shadow-float scale-[1.01]'
                  : 'bg-white border-secondary-light/60 hover:border-secondary hover:bg-bg-lavender/40 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-bg-lavender text-ink-muted'
                  }`}
                >
                  {option.id.toUpperCase()}
                </div>
                <span className="font-bold text-base sm:text-lg text-ink">
                  {option.label}
                </span>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedId || isSubmitting}
        className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 btn-bouncy"
      >
        <Sparkles className="w-5 h-5" /> Submit Answer
      </button>
    </div>
  );
}
