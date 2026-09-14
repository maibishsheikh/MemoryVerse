'use client';

import React from 'react';

interface ProgressIndicatorProps {
  value: number; // 0 to 1
  label?: string;
  variant?: 'bar' | 'steps';
  totalSteps?: number;
  currentStep?: number;
  className?: string;
}

export default function ProgressIndicator({
  value,
  label,
  variant = 'bar',
  totalSteps = 5,
  currentStep = 1,
  className = '',
}: ProgressIndicatorProps) {
  const percentage = Math.round(Math.min(1, Math.max(0, value)) * 100);

  if (variant === 'steps') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${
              i < currentStep
                ? 'bg-gradient-to-r from-primary to-success shadow-sm'
                : i === currentStep - 1
                ? 'bg-accent animate-pulse'
                : 'bg-bg-lavender border border-secondary-light/40'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-xs font-bold text-ink-muted">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="h-3 w-full bg-bg-lavender rounded-full overflow-hidden p-0.5 border border-secondary-light/40">
        <div
          className="h-full bg-gradient-to-r from-primary via-secondary to-success rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
