'use client';

import React from 'react';
import { MasteryStage } from '@/types/lesson';
import { MASTERY_STAGE_METADATA } from '@/lib/scoring/mastery';

interface MasteryMeterProps {
  score: number;
  stage: MasteryStage;
  className?: string;
}

const STAGES: MasteryStage[] = ['discovered', 'practising', 'strong', 'mastered'];

export default function MasteryMeter({ score, stage, className = '' }: MasteryMeterProps) {
  const currentStageMeta = MASTERY_STAGE_METADATA[stage] || MASTERY_STAGE_METADATA.discovered;
  const currentStageIndex = STAGES.indexOf(stage);

  return (
    <div className={`bg-white rounded-4xl p-6 border border-secondary-light/60 shadow-card ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
            style={{ backgroundColor: currentStageMeta.bg }}
          >
            {currentStageMeta.icon}
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Mastery Stage
            </div>
            <div
              className="font-heading font-extrabold text-xl"
              style={{ color: currentStageMeta.color }}
            >
              {currentStageMeta.label}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="font-heading font-extrabold text-2xl text-ink">
            {score}
          </span>
          <span className="text-xs font-bold text-ink-muted"> / 100</span>
        </div>
      </div>

      {/* 4-Stage Segmented Bar */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {STAGES.map((s, idx) => {
          const meta = MASTERY_STAGE_METADATA[s];
          const isReached = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div key={s} className="space-y-1">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  isReached
                    ? 'shadow-sm'
                    : 'bg-bg-lavender border border-secondary-light/30'
                }`}
                style={{
                  backgroundColor: isReached ? meta.color : undefined,
                }}
              />
              <div
                className={`text-[11px] text-center font-extrabold truncate ${
                  isCurrent ? 'text-ink' : 'text-ink-muted/70'
                }`}
              >
                {meta.label}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs font-bold text-ink-muted text-center mt-3 bg-bg-lavender/40 py-2 px-3 rounded-2xl">
        {currentStageMeta.description}
      </p>
    </div>
  );
}
