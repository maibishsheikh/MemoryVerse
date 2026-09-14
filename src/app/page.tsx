'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { Lesson } from '@/types/lesson';
import Character from '@/components/ui/Character';
import {
  Sparkles,
  Flame,
  ArrowRight,
  Zap,
  RotateCcw,
  BookOpen,
  Trophy,
  Play,
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  vedic_maths: { bg: 'bg-primary-light/40 border-primary', text: 'text-primary-dark', icon: '🔢' },
  visual_association: { bg: 'bg-secondary-light/40 border-secondary', text: 'text-secondary-dark', icon: '🦢' },
  memory_palace: { bg: 'bg-accent-light/40 border-accent', text: 'text-accent-dark', icon: '🏠' },
  chunking: { bg: 'bg-success-light/40 border-success', text: 'text-success-dark', icon: '⚡' },
  mnemonics: { bg: 'bg-attention-light/40 border-attention', text: 'text-attention-dark', icon: '🧠' },
};

export default function HomePage() {
  const { activeChild, isLoading } = usePlatformStore();
  const [lessons, setLessons] = useState<Array<Omit<Lesson, 'sections'> & { orderIndex: number }>>([]);
  const [featuredLesson, setFeaturedLesson] = useState<Omit<Lesson, 'sections'> | null>(null);

  useEffect(() => {
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLessons(data);
          setFeaturedLesson(data[0] || null);
        }
      })
      .catch((err) => console.error('Error fetching lessons:', err));
  }, []);

  const childName = activeChild?.displayName || 'Memory Champ';

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Greeting Section */}
      <section className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-bg-lavender via-white to-bg-blue p-6 sm:p-10 border-2 border-secondary-light/60 shadow-soft">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-light/60 border border-accent/40 text-xs font-extrabold text-ink">
              <Sparkles className="w-4 h-4 text-accent-dark fill-accent" />
              <span>Supercharge Your Working Memory</span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-ink tracking-tight leading-tight">
              Ready to learn, <span className="text-primary-dark">{childName}</span>?
            </h1>

            <p className="text-base sm:text-lg font-bold text-ink-muted leading-relaxed">
              Don't just memorize — <span className="text-ink">see it, manipulate it, and recall it forever</span> with interactive simulations!
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              {featuredLesson && (
                <Link
                  href={`/lesson/${featuredLesson.id}`}
                  className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all btn-bouncy"
                >
                  <Play className="w-5 h-5 fill-white" /> Start Today's Mission
                </Link>
              )}

              <Link
                href="/review"
                className="flex items-center gap-2 px-6 py-4 rounded-full bg-white border-2 border-secondary-light font-heading font-extrabold text-ink hover:bg-bg-lavender transition-all btn-bouncy"
              >
                <RotateCcw className="w-5 h-5 text-secondary-dark" /> Spaced Review
              </Link>
            </div>
          </div>

          {/* Animated Hero Character Pair */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-6 bg-gradient-to-tr from-primary-light/40 via-accent-light/30 to-secondary-light/40 rounded-full blur-2xl -z-10" />
            <div className="flex items-center -space-x-4">
              <Character name="professor_piko" size="lg" className="animate-bounce-soft" />
              <Character name="byte" size="md" className="translate-y-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Today's Challenge Card */}
      {featuredLesson && (
        <section className="bg-white rounded-4xl p-6 sm:p-8 border-2 border-primary/40 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary text-white font-heading font-extrabold text-3xl sm:text-4xl flex items-center justify-center shadow-float shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary-light/30 text-primary-dark">
                  Featured Lesson
                </span>
                <span className="text-xs font-bold text-ink-muted">
                  Ages {featuredLesson.ageRange[0]}–{featuredLesson.ageRange[1]}
                </span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-ink mt-1">
                {featuredLesson.title}
              </h3>
              <p className="text-sm font-bold text-ink-muted">
                {featuredLesson.subtitle || 'Master lightning mental recall with interactive story and simulation!'}
              </p>
            </div>
          </div>

          <Link
            href={`/lesson/${featuredLesson.id}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-accent text-ink font-heading font-extrabold text-base shadow-float hover:bg-accent-dark transition-all flex items-center justify-center gap-2 btn-bouncy shrink-0"
          >
            Play Now <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      )}

      {/* Explore 5 Memory Techniques Catalog */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
              Explore 5 Memory Superpowers
            </h2>
            <p className="text-sm font-bold text-ink-muted">
              Choose a simulation playground to build your mental technique library
            </p>
          </div>
          <Link
            href="/learn"
            className="font-bold text-sm text-primary-dark hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((lesson) => {
            const cat = CATEGORY_COLORS[lesson.techniqueCategory] || {
              bg: 'bg-bg-lavender border-secondary',
              text: 'text-primary-dark',
              icon: '✨',
            };

            return (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                className="group bg-white rounded-4xl p-6 border-2 border-secondary-light/60 hover:border-primary shadow-sm hover:shadow-card transition-all flex flex-col justify-between gap-4 btn-bouncy"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <span
                      className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${cat.bg} ${cat.text}`}
                    >
                      {lesson.techniqueCategory.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-xl text-ink group-hover:text-primary-dark transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs font-bold text-ink-muted mt-1 leading-relaxed line-clamp-2">
                    {lesson.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-secondary-light/40">
                  <span className="text-xs font-bold text-ink-muted">
                    Ages {lesson.ageRange[0]}–{lesson.ageRange[1]}
                  </span>
                  <span className="inline-flex items-center gap-1 font-heading font-extrabold text-sm text-primary-dark group-hover:translate-x-1 transition-transform">
                    Start <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
