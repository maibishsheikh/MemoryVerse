'use client';

import React from 'react';
import { Question } from '@/types/lesson';
import NumericQuestion from './NumericQuestion';
import SingleSelectQuestion from './SingleSelectQuestion';
import OrderingQuestion from './OrderingQuestion';
import MatchingQuestion from './MatchingQuestion';
import HintButton from '../ui/HintButton';

interface QuestionCardProps {
  question: Question;
  hintsRevealed: number;
  onRequestHint: () => void;
  onSubmit: (answer: unknown) => void;
  isSubmitting?: boolean;
}

export default function QuestionCard({
  question,
  hintsRevealed,
  onRequestHint,
  onSubmit,
  isSubmitting,
}: QuestionCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto my-4 bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center">
      {/* Question Type Badge & Support Level */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-secondary-light/40 text-primary-dark">
          {question.type.replace('_', ' ')}
        </span>
        <span
          className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full ${
            question.supportLevel === 'guided'
              ? 'bg-success-light/40 text-success-dark'
              : question.supportLevel === 'assisted'
              ? 'bg-accent-light/50 text-ink'
              : 'bg-attention-light/40 text-attention-dark'
          }`}
        >
          {question.supportLevel}
        </span>
      </div>

      {/* Render matching question sub-component */}
      {question.type === 'numeric' && (
        <NumericQuestion
          question={question}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {(question.type === 'single_select' || question.type === 'multiple_choice') && (
        <SingleSelectQuestion
          question={question}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {question.type === 'ordering' && (
        <OrderingQuestion
          question={question}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {question.type === 'matching' && (
        <MatchingQuestion
          question={question}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Progressive Hint Drawer */}
      {question.hints && question.hints.length > 0 && (
        <div className="w-full mt-6 pt-4 border-t border-secondary-light/40">
          <HintButton
            hints={question.hints}
            hintsRevealed={hintsRevealed}
            onRequestHint={onRequestHint}
          />
        </div>
      )}
    </div>
  );
}
