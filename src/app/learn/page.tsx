'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lesson } from '@/types/lesson';
import { Sparkles, ArrowRight, Play, BookOpen, Layers } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Techniques' },
  { id: 'vedic_maths', label: '🔢 Vedic Maths' },
  { id: 'visual_association', label: '🦢 Visual Pegs' },
  { id: 'memory_palace', label: '🏠 Memory Palace' },
  { id: 'chunking', label: '⚡ Chunking' },
  { id: 'mnemonics', label: '🧠 Mnemonics' },
];

export default function LearnPage() {
  const [lessons, setLessons] = useState<Array<Omit<Lesson, 'sections'> & { orderIndex: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLessons(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredLessons =
    selectedCategory === 'all'
      ? lessons
      : lessons.filter((l) => l.techniqueCategory === selectedCategory);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-secondary-light/40 text-primary-dark font-extrabold text-xs">
          <BookOpen className="w-3.5 h-3.5" /> Memory Curriculum
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
          Interactive Technique Library
        </h1>
        <p className="text-sm font-bold text-ink-muted">
          Every lesson follows the proven 10-stage universal journey: Story, Interactive Simulation, Practice, and Active Recall!
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-white shadow-float scale-105'
                : 'bg-white border border-secondary-light text-ink-muted hover:bg-bg-lavender'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Lessons List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-4xl p-6 sm:p-8 border-2 border-secondary-light/60 hover:border-primary shadow-sm hover:shadow-card transition-all flex flex-col justify-between gap-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-bg-blue text-primary-dark border border-primary/30">
                  {lesson.techniqueCategory.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold text-ink-muted">
                  Recommended: Ages {lesson.ageRange[0]}–{lesson.ageRange[1]}
                </span>
              </div>

              <h3 className="font-heading font-extrabold text-2xl text-ink">
                {lesson.title}
              </h3>

              <p className="text-sm font-bold text-ink-muted leading-relaxed">
                {lesson.subtitle}
              </p>

              {/* 10-Stage Micro Flow Badge */}
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-ink-muted bg-bg-lavender/60 p-2 rounded-2xl">
                <span>Hook</span> → <span>Story</span> → <span>Visual</span> → <span>Playground</span> → <span>Practice</span> → <span>Recall</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-secondary-light/40">
              <span className="text-xs font-bold text-success-dark flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> +80 XP on completion
              </span>

              <Link
                href={`/lesson/${lesson.id}`}
                className="px-6 py-3 rounded-full bg-primary text-white font-heading font-extrabold text-sm shadow-float hover:bg-primary-dark transition-all flex items-center gap-2 btn-bouncy"
              >
                <Play className="w-4 h-4 fill-white" /> Start Lesson
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
