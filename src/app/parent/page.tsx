'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { ChildProfile, MasteryStage } from '@/types/lesson';
import {
  ShieldCheck,
  User,
  TrendingUp,
  Brain,
  Calendar,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ParentData {
  child: ChildProfile;
  lessons: Array<{
    lessonId: string;
    lessonTitle: string;
    techniqueCategory: string;
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

export default function ParentDashboardPage() {
  const { children, activeChild, setActiveChild } = usePlatformStore();
  const [data, setData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedChildId = activeChild?.id || (children[0]?.id ?? 'child_mia_001');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/children/${selectedChildId}/progress`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedChildId]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-4xl p-6 sm:p-8 border border-secondary-light/80 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary-light/40 text-secondary-dark flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase text-secondary-dark tracking-wider">
              Parent & Educator Analytics
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
              Learning & Memory Insights
            </h1>
          </div>
        </div>

        {/* Child Selector Tabs */}
        <div className="flex items-center gap-2 bg-bg-lavender p-1.5 rounded-2xl border border-secondary-light/60">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChild(c)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                selectedChildId === c.id
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {c.displayName} ({c.ageBand})
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-secondary-light/60 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted text-xs font-bold uppercase mb-2">
            <span>Lessons Completed</span>
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="font-heading font-extrabold text-3xl text-ink">
            {data?.completedLessonsCount || 0}
          </div>
          <div className="text-[11px] text-success-dark font-bold mt-1">
            Active retention tracking enabled
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-secondary-light/60 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted text-xs font-bold uppercase mb-2">
            <span>Total Experience (XP)</span>
            <Sparkles className="w-4 h-4 text-accent-dark" />
          </div>
          <div className="font-heading font-extrabold text-3xl text-ink">
            {data?.child?.currentXp || 0}
          </div>
          <div className="text-[11px] text-ink-muted font-bold mt-1">
            Includes independent answer bonuses
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-secondary-light/60 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted text-xs font-bold uppercase mb-2">
            <span>Practice Streak</span>
            <TrendingUp className="w-4 h-4 text-attention" />
          </div>
          <div className="font-heading font-extrabold text-3xl text-attention-dark">
            {data?.child?.currentStreak || 1} Days
          </div>
          <div className="text-[11px] text-ink-muted font-bold mt-1">
            Consistent retrieval schedule
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-secondary-light/60 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted text-xs font-bold uppercase mb-2">
            <span>Badges Earned</span>
            <Award className="w-4 h-4 text-secondary-dark" />
          </div>
          <div className="font-heading font-extrabold text-3xl text-secondary-dark">
            {data?.badges?.length || 0} / 5
          </div>
          <div className="text-[11px] text-ink-muted font-bold mt-1">
            Technique milestones unlocked
          </div>
        </div>
      </div>

      {/* Technique Mastery Breakdown Matrix */}
      <section className="bg-white rounded-4xl p-6 sm:p-8 border border-secondary-light/80 shadow-soft space-y-6">
        <div>
          <h2 className="font-heading font-extrabold text-xl text-ink">
            Memory Strategy Mastery Breakdown
          </h2>
          <p className="text-xs font-bold text-ink-muted">
            Detailed score evaluated from attempt accuracy (40%), independent answers (25%), delayed recall (25%), and consistency (10%).
          </p>
        </div>

        {data?.lessons && data.lessons.length > 0 ? (
          <div className="divide-y divide-secondary-light/40">
            {data.lessons.map((lesson) => (
              <div
                key={lesson.lessonId}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-lg text-ink">
                      {lesson.lessonTitle}
                    </span>
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-bg-lavender text-primary-dark">
                      {lesson.techniqueCategory.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-ink-muted mt-0.5">
                    Last refreshed: {new Date(lesson.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-heading font-extrabold text-xl text-ink">
                      {lesson.masteryScore}%
                    </div>
                    <div className="text-xs font-extrabold capitalize text-primary-dark">
                      {lesson.masteryStage}
                    </div>
                  </div>

                  <div className="w-32 h-3 bg-bg-lavender rounded-full overflow-hidden p-0.5 border border-secondary-light/40">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                      style={{ width: `${lesson.masteryScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-bg-lavender/40 text-center font-bold text-sm text-ink-muted">
            No completed lessons for this child profile yet.
          </div>
        )}
      </section>

      {/* Educational Recommendations & Memory Principles */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-blue/60 rounded-4xl p-6 sm:p-8 border border-primary/30 space-y-3">
          <h3 className="font-heading font-extrabold text-lg text-ink flex items-center gap-2">
            <span>💡</span> Pedagogical Recommendation
          </h3>
          <p className="text-xs sm:text-sm font-bold text-ink leading-relaxed">
            Spaced retrieval practice is most effective when tests occur 24 to 72 hours after initial exposure. Encourage short 3-minute review sessions on the Review tab rather than long study blocks.
          </p>
        </div>

        <div className="bg-bg-lavender/60 rounded-4xl p-6 sm:p-8 border border-secondary/30 space-y-3">
          <h3 className="font-heading font-extrabold text-lg text-ink flex items-center gap-2">
            <span>🛡️</span> Child Privacy & Independence
          </h3>
          <p className="text-xs sm:text-sm font-bold text-ink leading-relaxed">
            All data is saved locally on this device. No advertising or public profiling is present. Hints are gently faded to foster self-reliance and intrinsic motivation.
          </p>
        </div>
      </section>
    </div>
  );
}
