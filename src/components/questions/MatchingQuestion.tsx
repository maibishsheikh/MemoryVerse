'use client';

import React, { useState } from 'react';
import { Question } from '@/types/lesson';
import { Check, Link as LinkIcon, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

interface MatchingQuestionProps {
  question: Question;
  onSubmit: (answer: Record<string, string>) => void;
  isSubmitting?: boolean;
}

export default function MatchingQuestion({
  question,
  onSubmit,
  isSubmitting,
}: MatchingQuestionProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const pairs = question.pairs || [];
  const leftItems = pairs.map((p) => p.left);
  const rightItems = pairs.map((p) => p.right);

  const handleLeftClick = (id: string) => {
    soundFx.playPop();
    setSelectedLeft(id);
  };

  const handleRightClick = (rightId: string) => {
    if (!selectedLeft) return;
    soundFx.playPop();

    setMatches((prev) => ({
      ...prev,
      [selectedLeft]: rightId,
    }));
    setSelectedLeft(null);
  };

  const handleRemoveMatch = (leftId: string) => {
    soundFx.playPop();
    setMatches((prev) => {
      const next = { ...prev };
      delete next[leftId];
      return next;
    });
  };

  const isComplete = leftItems.every((item) => matches[item.id]);

  const handleSubmit = () => {
    if (isComplete) {
      onSubmit(matches);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      <div className="w-full text-center">
        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight mb-2">
          {question.prompt}
        </h3>
        <p className="text-xs font-bold text-ink-muted">
          Tap a card on the left, then tap its matching pair on the right
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-2">
            Target Item
          </div>
          {leftItems.map((left) => {
            const isSelected = selectedLeft === left.id;
            const matchedRightId = matches[left.id];
            const matchedRight = rightItems.find((r) => r.id === matchedRightId);

            return (
              <button
                key={left.id}
                type="button"
                onClick={() => handleLeftClick(left.id)}
                disabled={isSubmitting}
                className={`w-full p-4 rounded-3xl border-2 text-left flex items-center justify-between gap-3 transition-all ${
                  isSelected
                    ? 'border-primary bg-bg-blue shadow-float scale-[1.02]'
                    : matchedRight
                    ? 'border-success bg-success-light/20 text-ink shadow-sm'
                    : 'border-secondary-light/60 bg-white hover:bg-bg-lavender text-ink'
                }`}
              >
                <div>
                  <div className="font-extrabold text-base">{left.label}</div>
                  {matchedRight && (
                    <div className="text-xs font-bold text-success-dark flex items-center gap-1 mt-1">
                      <LinkIcon className="w-3 h-3" /> Linked to: {matchedRight.label}
                    </div>
                  )}
                </div>

                {matchedRight && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMatch(left.id);
                    }}
                    className="text-xs font-bold text-error hover:underline px-2 py-1 rounded-lg hover:bg-error-light/20"
                  >
                    Unlink
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-2">
            Matching Visual Peg
          </div>
          {rightItems.map((right) => {
            const isMatched = Object.values(matches).includes(right.id);

            return (
              <button
                key={right.id}
                type="button"
                onClick={() => handleRightClick(right.id)}
                disabled={isSubmitting || !selectedLeft}
                className={`w-full p-4 rounded-3xl border-2 text-left flex items-center justify-between gap-3 transition-all ${
                  isMatched
                    ? 'border-success/50 bg-success-light/20 opacity-80'
                    : selectedLeft
                    ? 'border-primary/60 bg-white hover:bg-primary-light/20 cursor-pointer shadow-sm animate-pulse-subtle'
                    : 'border-secondary-light/60 bg-white opacity-90'
                }`}
              >
                <span className="font-extrabold text-base text-ink">
                  {right.label}
                </span>
                {isMatched && <Check className="w-4 h-4 text-success-dark" />}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isComplete || isSubmitting}
        className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 btn-bouncy"
      >
        <Sparkles className="w-5 h-5" /> Check Matches
      </button>
    </div>
  );
}
