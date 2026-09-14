'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { MasteryStage, Badge } from '@/types/lesson';
import MasteryMeter from '@/components/ui/MasteryMeter';
import Character from '@/components/ui/Character';
import {
  Trophy,
  Flame,
  Sparkles,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface ProgressData {
  child: {
    displayName: string;
    currentXp: number;
    currentStreak: number;
    ageBand: string;
    avatarKey: string;
  };
  lessons: Array<{
    lessonId: string;
    lessonTitle: string;
    masteryScore: number;
    masteryStage: MasteryStage;
    updatedAt: string;
  }>;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    iconKey: string;
    earnedAt: string;
  }>;
  completedLessonsCount: number;
}

const ALL_BADGES = [
  { id: 'number-ninja', name: 'Number Ninja', description: 'Mastered Vedic ×11 lightning mental math!', iconKey: '🔢' },
  { id: 'pattern-spotter', name: 'Pattern Spotter', description: 'Discovered hidden visual pegs in numbers!', iconKey: '🏅' },
  { id: 'palace-builder', name: 'Palace Builder', description: 'Constructed and walked a spatial Memory Palace!', iconKey: '🏠' },
  { id: 'fast-thinker', name: 'Fast Thinker', description: 'Broke huge sequences into bite-sized chunks!', iconKey: '⚡' },
  { id: 'memory-explorer', name: 'Memory Explorer', description: 'Built cosmic mnemonic sentence bridges!', iconKey: '🧠' },
];

export default function ProgressPage() {
  const { activeChild } = usePlatformStore();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const childId = activeChild?.id || 'child_mia_001';

  useEffect(() => {
    fetch(`/api/children/${childId}/progress`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [childId]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Profile Summary Card */}
      <section className="bg-gradient-to-tr from-bg-blue via-white to-bg-lavender rounded-5xl p-6 sm:p-10 border-2 border-secondary-light/60 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-white border-2 border-primary/40 flex items-center justify-center shadow-float">
              <Character
                name={activeChild?.avatarKey === 'aarav' ? 'aarav' : 'mia'}
                size="md"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary-light/40 text-primary-dark">
                  {data?.child?.ageBand || 'Learner'} Band
                </span>
              </div>
              <h1 className="font-heading font-extrabold text-3xl text-ink mt-1">
                {data?.child?.displayName || 'Mia'}'s Memory Vault
              </h1>
              <p className="text-xs font-bold text-ink-muted mt-0.5">
                Strengthening memory capacity through science-backed techniques
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-3xl bg-accent-light/50 border border-accent/40 text-center min-w-[90px]">
              <Sparkles className="w-5 h-5 text-accent-dark fill-accent mx-auto" />
              <div className="font-heading font-extrabold text-xl text-ink mt-1">
                {data?.child?.currentXp || 0}
              </div>
              <div className="text-[10px] font-extrabold text-ink-muted uppercase">Total XP</div>
            </div>

            <div className="p-3.5 rounded-3xl bg-attention-light/40 border border-attention/30 text-center min-w-[90px]">
              <Flame className="w-5 h-5 text-attention fill-attention mx-auto" />
              <div className="font-heading font-extrabold text-xl text-attention-dark mt-1">
                {data?.child?.currentStreak || 1}d
              </div>
              <div className="text-[10px] font-extrabold text-ink-muted uppercase">Streak</div>
            </div>

            <div className="p-3.5 rounded-3xl bg-success-light/30 border border-success/30 text-center min-w-[90px]">
              <Trophy className="w-5 h-5 text-success-dark mx-auto" />
              <div className="font-heading font-extrabold text-xl text-success-dark mt-1">
                {data?.badges?.length || 0}
              </div>
              <div className="text-[10px] font-extrabold text-ink-muted uppercase">Badges</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mastery Meters Per Technique */}
      <section className="space-y-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-ink">
            Technique Mastery Meters
          </h2>
          <p className="text-sm font-bold text-ink-muted">
            Mastery is dynamic: it rises with independent accuracy and sustains through spaced reviews
          </p>
        </div>

        {data?.lessons && data.lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.lessons.map((item) => (
              <div key={item.lessonId} className="space-y-2">
                <div className="font-heading font-extrabold text-lg text-ink px-2">
                  {item.lessonTitle}
                </div>
                <MasteryMeter score={item.masteryScore} stage={item.masteryStage} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-4xl p-8 text-center border border-secondary-light/60">
            <p className="font-bold text-ink-muted mb-4">
              No lessons played yet. Complete your first lesson to see your mastery score!
            </p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-extrabold text-sm shadow-float hover:bg-primary-dark btn-bouncy"
            >
              Start First Lesson <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Badges Showcase */}
      <section className="space-y-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-ink">
            Badge Hall of Fame
          </h2>
          <p className="text-sm font-bold text-ink-muted">
            Unlock all 5 technique mastery medals by completing interactive challenges
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_BADGES.map((badge) => {
            const isEarned = data?.badges?.some((b) => b.id === badge.id);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-4xl border-2 flex items-center gap-4 transition-all ${
                  isEarned
                    ? 'bg-white border-accent shadow-soft'
                    : 'bg-white/60 border-secondary-light/40 opacity-50 grayscale'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0 ${
                    isEarned ? 'bg-accent-light' : 'bg-bg-lavender'
                  }`}
                >
                  {badge.iconKey}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-extrabold text-lg text-ink">
                      {badge.name}
                    </h4>
                    {isEarned && <CheckCircle2 className="w-4 h-4 text-success-dark shrink-0" />}
                  </div>
                  <p className="text-xs font-bold text-ink-muted leading-tight mt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
