'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { ReviewScheduleItem, MasteryStage } from '@/types/lesson';
import { soundFx } from '@/lib/audio/sound-effects';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Sparkles,
  Calendar,
  CheckCircle2,
  Play,
  ArrowRight,
  Trophy,
} from 'lucide-react';

export default function ReviewQueuePage() {
  const { activeChild } = usePlatformStore();
  const [reviews, setReviews] = useState<ReviewScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active review mini-challenge state
  const [activeReview, setActiveReview] = useState<ReviewScheduleItem | null>(null);
  const [recallAnswer, setRecallAnswer] = useState('');
  const [reviewResult, setReviewResult] = useState<{
    newMasteryStage: MasteryStage;
    nextReviewDate: string;
    xpAwarded: number;
  } | null>(null);

  const childId = activeChild?.id || 'child_mia_001';

  const fetchReviews = () => {
    fetch(`/api/children/${childId}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, [childId]);

  const handleStartReview = (rev: ReviewScheduleItem) => {
    soundFx.playPop();
    setActiveReview(rev);
    setRecallAnswer('');
    setReviewResult(null);
  };

  const handleCompleteReview = async (performanceScore: number) => {
    if (!activeReview) return;

    try {
      const res = await fetch(`/api/reviews/${activeReview.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performanceScore }),
      });

      if (res.ok) {
        const data = await res.json();
        soundFx.playCelebration();
        setReviewResult(data);
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch {}
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent-light text-ink font-extrabold text-xs">
          <RotateCcw className="w-3.5 h-3.5 text-accent-dark" /> Spaced Repetition Arena
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
          Active Recall & Spaced Reviews
        </h1>
        <p className="text-sm font-bold text-ink-muted">
          Short, lightning recall challenges spaced across 1, 3, 7, 14, and 30 days lock concepts into permanent memory!
        </p>
      </div>

      {/* Active Recall Challenge Modal / Overlay */}
      {activeReview && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-5xl max-w-lg w-full p-6 sm:p-10 shadow-card border-2 border-secondary-light flex flex-col items-center text-center gap-6">
            {!reviewResult ? (
              <>
                <div className="w-16 h-16 rounded-3xl bg-bg-blue flex items-center justify-center text-3xl shadow-sm">
                  🧠
                </div>

                <div>
                  <span className="text-xs font-extrabold uppercase text-primary-dark">
                    Recall Test #{activeReview.reviewNumber}
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-ink mt-1">
                    {activeReview.lessonTitle || activeReview.lessonId}
                  </h3>
                  <p className="text-xs font-bold text-ink-muted mt-2">
                    Without looking at notes: explain the key rule or solve a test problem!
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <div className="p-4 rounded-3xl bg-bg-lavender text-left font-bold text-sm text-ink border border-secondary-light/40">
                    <span className="font-extrabold text-primary-dark block mb-1">
                      Quick Prompt:
                    </span>
                    {activeReview.lessonId === 'vedic-x11' && 'What is 35 × 11? (Split 3 & 5, middle is 3+5=8 -> 385)'}
                    {activeReview.lessonId === 'visual-association' && 'What is the peg picture for number 8? (Snowman ⛄)'}
                    {activeReview.lessonId === 'memory-palace' && 'What was station #1 in your bedroom? (Entrance Door 🚪)'}
                    {activeReview.lessonId === 'chunking' && 'How many chunks can working memory hold at once? (3–4)'}
                    {activeReview.lessonId === 'mnemonics' && 'What planet comes 3rd in the nachos mnemonic? (Earth 🌍)'}
                  </div>

                  <input
                    type="text"
                    value={recallAnswer}
                    onChange={(e) => setRecallAnswer(e.target.value)}
                    placeholder="Type your answer / recall..."
                    className="w-full px-4 py-3 rounded-2xl border border-secondary-light font-bold text-center text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-2 w-full pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveReview(null)}
                    className="flex-1 py-3 rounded-full border border-secondary-light font-bold text-ink-muted hover:bg-bg-lavender"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCompleteReview(90)}
                    disabled={!recallAnswer.trim()}
                    className="flex-1 py-3 rounded-full bg-success text-white font-heading font-extrabold text-base shadow-float hover:bg-success-dark disabled:opacity-40 btn-bouncy"
                  >
                    Submit Recall
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-success-light flex items-center justify-center text-4xl shadow-float animate-bounce-soft">
                  ⭐
                </div>

                <div>
                  <h3 className="font-heading font-extrabold text-3xl text-ink">
                    Review Passed!
                  </h3>
                  <p className="text-sm font-bold text-ink-muted mt-1">
                    Your long-term memory interval has been extended!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="p-3.5 rounded-2xl bg-bg-blue border border-primary/30">
                    <span className="text-[11px] font-bold text-ink-muted uppercase block">Mastery Stage</span>
                    <span className="font-heading font-extrabold text-lg text-primary-dark capitalize">
                      {reviewResult.newMasteryStage}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-bg-lavender border border-secondary/30">
                    <span className="text-[11px] font-bold text-ink-muted uppercase block">Next Review</span>
                    <span className="font-heading font-extrabold text-sm text-secondary-dark mt-1 block">
                      {reviewResult.nextReviewDate}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveReview(null);
                    setReviewResult(null);
                  }}
                  className="w-full py-3.5 rounded-full bg-primary text-white font-heading font-extrabold text-base shadow-float hover:bg-primary-dark btn-bouncy"
                >
                  Awesome! Back to Queue
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Queue List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-5xl p-10 text-center border-2 border-secondary-light/60 shadow-sm space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="font-heading font-extrabold text-2xl text-ink">
              All Caught Up!
            </h3>
            <p className="text-sm font-bold text-ink-muted max-w-md mx-auto">
              You have no pending spaced reviews right now. Complete a new lesson to schedule your next memory check!
            </p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-heading font-extrabold text-sm shadow-float hover:bg-primary-dark transition-all btn-bouncy"
            >
              Browse Lessons <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-6 rounded-4xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
                rev.status === 'completed'
                  ? 'bg-success-light/10 border-success/30 opacity-70'
                  : 'bg-white border-secondary-light/60 shadow-sm hover:shadow-card'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-bg-lavender text-primary-dark font-heading font-extrabold text-xl flex items-center justify-center shrink-0">
                  #{rev.reviewNumber}
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-xl text-ink">
                    {rev.lessonTitle || rev.lessonId}
                  </h4>
                  <div className="flex items-center gap-3 text-xs font-bold text-ink-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Scheduled: {rev.scheduledFor}
                    </span>
                    <span className="capitalize">Status: {rev.status}</span>
                  </div>
                </div>
              </div>

              {rev.status === 'scheduled' ? (
                <button
                  onClick={() => handleStartReview(rev)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-accent text-ink font-heading font-extrabold text-sm shadow-float hover:bg-accent-dark transition-all flex items-center justify-center gap-2 btn-bouncy shrink-0"
                >
                  <Play className="w-4 h-4" /> Start Review
                </button>
              ) : (
                <div className="text-xs font-extrabold text-success-dark flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
