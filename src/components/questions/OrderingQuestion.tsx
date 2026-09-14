'use client';

import React, { useState } from 'react';
import { Question } from '@/types/lesson';
import { ArrowUp, ArrowDown, Sparkles, GripVertical } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface OrderingQuestionProps {
  question: Question;
  onSubmit: (answer: string[]) => void;
  isSubmitting?: boolean;
}

export default function OrderingQuestion({
  question,
  onSubmit,
  isSubmitting,
}: OrderingQuestionProps) {
  // Initialize in a shuffled or initial order
  const [items, setItems] = useState<{ id: string; label: string }[]>(() => {
    return question.options ? [...question.options] : [];
  });

  const moveItem = (index: number, direction: 'up' | 'down') => {
    soundFx.playPop();
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const handleSubmit = () => {
    const orderedIds = items.map((i) => i.id);
    onSubmit(orderedIds);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
      <div className="w-full text-center">
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight mb-2">
          {question.prompt}
        </h3>
        <p className="text-xs font-bold text-ink-muted">
          Use the arrows to put the steps in the correct order from top to bottom
        </p>
      </div>

      <div className="w-full space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="w-full p-4 sm:p-5 rounded-3xl bg-white border-2 border-secondary-light shadow-sm flex items-center justify-between gap-3 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary-dark font-extrabold text-sm flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <span className="font-bold text-sm sm:text-base text-ink">
                {item.label}
              </span>
            </div>

            {/* Move Up / Down Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0 || isSubmitting}
                className="w-9 h-9 rounded-xl bg-bg-lavender text-ink-muted hover:text-primary-dark hover:bg-bg-blue disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors"
                aria-label="Move item up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1 || isSubmitting}
                className="w-9 h-9 rounded-xl bg-bg-lavender text-ink-muted hover:text-primary-dark hover:bg-bg-blue disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors"
                aria-label="Move item down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
      >
        <Sparkles className="w-5 h-5" /> Check Sequence
      </button>
    </div>
  );
}
