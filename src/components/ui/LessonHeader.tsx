'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLessonStore } from '@/lib/store/useLessonStore';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { X, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface LessonHeaderProps {
  lessonTitle: string;
}

const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
  hook: { label: 'Curiosity Hook', icon: '❓' },
  story: { label: 'Story Mission', icon: '📖' },
  explanation: { label: 'Concept Visual', icon: '💡' },
  simulation: { label: 'Simulation Playground', icon: '🎮' },
  practice: { label: 'Practice Time', icon: '🎯' },
  recall: { label: 'Active Recall', icon: '🧠' },
  result: { label: 'Mastery Result', icon: '👑' },
};

export default function LessonHeader({ lessonTitle }: LessonHeaderProps) {
  const router = useRouter();
  const { lesson, currentSectionIndex } = useLessonStore();
  const { isMuted, toggleMuted } = usePlatformStore();
  const [showExitModal, setShowExitModal] = useState(false);

  const currentSection = lesson?.sections[currentSectionIndex];
  const sectionMeta = currentSection ? SECTION_LABELS[currentSection?.type] : { label: 'Lesson', icon: '✨' };

  const totalSections = lesson?.sections.length || 1;
  const progressPercent = Math.round(((currentSectionIndex + 1) / totalSections) * 100);

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-secondary-light/40 py-3 px-4 sm:px-8 shadow-soft">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Exit button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitModal(true)}
            aria-label="Exit lesson"
            className="w-10 h-10 rounded-full bg-white border border-secondary-light flex items-center justify-center text-ink-muted hover:text-error hover:border-error transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base sm:text-lg text-ink">
                {lessonTitle}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-secondary-light/50 text-primary-dark">
                {sectionMeta.icon} {sectionMeta.label}
              </span>
            </div>
            <div className="text-xs text-ink-muted font-bold">
              Step {currentSectionIndex + 1} of {totalSections}
            </div>
          </div>
        </div>

        {/* Center: Stage Progress Bar */}
        <div className="flex-1 max-w-xs mx-4 hidden md:block">
          <div className="h-3 w-full bg-bg-lavender rounded-full overflow-hidden border border-secondary-light/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Audio toggle & XP chip */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMuted}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="w-10 h-10 rounded-full bg-white border border-secondary-light flex items-center justify-center text-ink-muted hover:text-primary-dark transition-all shadow-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-primary-dark" />}
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-sm w-full p-6 text-center shadow-card border border-secondary-light">
            <div className="text-4xl mb-3">👋</div>
            <h3 className="font-heading text-2xl font-bold text-ink mb-1">
              Pause this lesson?
            </h3>
            <p className="text-sm text-ink-muted mb-6">
              You can return anytime and pick up right where you left off!
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 rounded-full border border-secondary-light font-bold text-ink hover:bg-bg-lavender transition-all"
              >
                Keep Playing
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  router.push('/');
                }}
                className="flex-1 py-3 rounded-full bg-attention text-ink font-extrabold hover:bg-attention-dark shadow-float transition-all"
              >
                Exit Home
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
