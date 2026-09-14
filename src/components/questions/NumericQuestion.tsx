'use client';

import React, { useState } from 'react';
import { Question } from '@/types/lesson';
import { Delete, Check } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface NumericQuestionProps {
  question: Question;
  onSubmit: (answer: number) => void;
  isSubmitting?: boolean;
}

export default function NumericQuestion({
  question,
  onSubmit,
  isSubmitting,
}: NumericQuestionProps) {
  const [value, setValue] = useState<string>('');

  const handleDigit = (d: string) => {
    soundFx.playPop();
    if (value.length < 8) {
      setValue((prev) => prev + d);
    }
  };

  const handleDelete = () => {
    soundFx.playPop();
    setValue((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    soundFx.playPop();
    setValue('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (value.trim()) {
      onSubmit(Number(value));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      {/* Question Prompt */}
      <div className="w-full text-center">
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight mb-2">
          {question.prompt}
        </h3>
        <p className="text-xs font-bold text-ink-muted">
          Type your answer using the keypad or your keyboard
        </p>
      </div>

      {/* Answer Display Box */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative w-full h-20 bg-white rounded-3xl border-2 border-primary/40 focus-within:border-primary shadow-soft flex items-center justify-center px-6">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="?"
            disabled={isSubmitting}
            autoFocus
            className="w-full text-center font-heading font-extrabold text-4xl text-ink bg-transparent focus:outline-none placeholder:text-secondary-light"
          />
        </div>
      </form>

      {/* Child-Friendly Keypad */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            className="h-14 rounded-2xl bg-white border border-secondary-light text-2xl font-heading font-extrabold text-ink hover:bg-bg-lavender hover:border-secondary transition-all shadow-sm active:scale-95 flex items-center justify-center btn-bouncy"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClear}
          className="h-14 rounded-2xl bg-bg-lavender border border-secondary-light/60 font-bold text-sm text-ink-muted hover:bg-error-light/30 transition-all flex items-center justify-center btn-bouncy"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-14 rounded-2xl bg-white border border-secondary-light text-2xl font-heading font-extrabold text-ink hover:bg-bg-lavender transition-all shadow-sm flex items-center justify-center btn-bouncy"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-bg-lavender border border-secondary-light/60 text-ink-muted hover:text-ink transition-all flex items-center justify-center btn-bouncy"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={() => handleSubmit()}
        disabled={!value.trim() || isSubmitting}
        className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 btn-bouncy"
      >
        <Check className="w-5 h-5" /> Check Answer
      </button>
    </div>
  );
}
