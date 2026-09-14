'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLessonStore } from '@/lib/store/useLessonStore';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { Lesson } from '@/types/lesson';
import LessonHeader from '@/components/ui/LessonHeader';
import StoryPanel from '@/components/ui/StoryPanel';
import QuestionCard from '@/components/questions/QuestionCard';
import SimulationCanvas from '@/components/simulations/SimulationCanvas';
import FeedbackToast from '@/components/ui/FeedbackToast';
import MasteryMeter from '@/components/ui/MasteryMeter';
import Character from '@/components/ui/Character';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Timer,
  ArrowRight,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Calendar,
  Home,
} from 'lucide-react';
import { soundFx } from '@/lib/audio/sound-effects';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.lessonId as string;

  const { activeChild } = usePlatformStore();
  const {
    lesson,
    currentSectionIndex,
    currentQuestionIndex,
    hintsRevealed,
    feedback,
    completionSummary,
    isSubmitting,
    initLesson,
    getCurrentSection,
    getCurrentQuestion,
    revealHint,
    submitAnswer,
    dismissFeedback,
    nextQuestion,
    nextSection,
    prevSection,
    resetLesson,
  } = useLessonStore();

  const [loading, setLoading] = useState(true);
  const [hookTimer, setHookTimer] = useState<number>(20);
  const [hookAnswer, setHookAnswer] = useState('');

  // Fetch lesson and init store
  useEffect(() => {
    if (!lessonId) return;

    fetch(`/api/lessons/${lessonId}`)
      .then((res) => res.json())
      .then((data: Lesson) => {
        const childId = activeChild?.id || 'child_mia_001';
        initLesson(data, childId);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load lesson:', err);
        setLoading(false);
      });

    return () => {
      resetLesson();
    };
  }, [lessonId, activeChild, initLesson, resetLesson]);

  // Hook timer countdown
  useEffect(() => {
    const section = getCurrentSection();
    if (section?.type === 'hook' && section.timerSeconds) {
      setHookTimer(section.timerSeconds);
      const interval = setInterval(() => {
        setHookTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSectionIndex, getCurrentSection]);

  if (loading || !lesson) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="font-heading font-bold text-xl text-ink">
          Summoning Memory Realm...
        </p>
      </div>
    );
  }

  const currentSection = getCurrentSection();
  const currentQuestion = getCurrentQuestion();

  return (
    <div className="min-h-screen flex flex-col -mx-4 sm:-mx-6 -my-6 bg-bg">
      {/* Sticky Header */}
      <LessonHeader lessonTitle={lesson.title} />

      {/* Main Interactive Stage Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* 1. HOOK STAGE */}
          {currentSection?.type === 'hook' && (
            <motion.div
              key="hook"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-5xl p-6 sm:p-12 shadow-card border-2 border-secondary-light/60 flex flex-col items-center text-center gap-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-light/60 border border-accent/40 text-xs font-extrabold text-ink">
                <Sparkles className="w-4 h-4 text-accent-dark fill-accent" /> Curiosity Challenge
              </div>

              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink max-w-xl leading-tight">
                {currentSection.prompt}
              </h2>

              <p className="text-sm font-bold text-ink-muted max-w-md">
                {currentSection.subtext || 'Take a quick attempt before the clock runs out, or discover the secret technique!'}
              </p>

              {/* Timer Pill */}
              {currentSection.timerSeconds && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-bg-lavender text-primary-dark font-extrabold text-sm border border-secondary-light/60">
                  <Timer className="w-4 h-4 animate-spin" />
                  <span>00:{hookTimer < 10 ? `0${hookTimer}` : hookTimer}</span>
                </div>
              )}

              {/* Quick Input Form */}
              <div className="w-full max-w-xs space-y-3">
                <input
                  type="text"
                  value={hookAnswer}
                  onChange={(e) => setHookAnswer(e.target.value)}
                  placeholder="Your guess / answer..."
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-secondary-light text-center font-heading font-extrabold text-2xl text-ink focus:outline-none focus:border-primary shadow-sm"
                />

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    nextSection();
                  }}
                  className="w-full py-4 rounded-full bg-primary text-white font-heading font-extrabold text-lg shadow-float hover:bg-primary-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
                >
                  <span>Discover the Secret</span> <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 2. STORY STAGE */}
          {currentSection?.type === 'story' && (
            <StoryPanel
              key="story"
              panels={currentSection.panels}
              onComplete={nextSection}
            />
          )}

          {/* 3. CONCEPT EXPLANATION ANIMATION */}
          {currentSection?.type === 'explanation' && (
            <motion.div
              key="explanation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center text-center gap-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bg-blue text-primary-dark font-extrabold text-xs">
                💡 Mental Model Concept
              </div>

              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
                {currentSection.title || 'How the Secret Works'}
              </h2>

              <p className="text-base font-bold text-ink-muted max-w-xl">
                {currentSection.summary}
              </p>

              {/* Visual Demonstration Box */}
              <div className="w-full max-w-lg p-6 sm:p-8 rounded-4xl bg-gradient-to-tr from-bg-lavender via-white to-bg-blue border-2 border-secondary-light shadow-inner space-y-4">
                {Array.isArray(currentSection.animation?.steps) && (
                  <div className="space-y-3">
                    {(currentSection.animation.steps as string[]).map((step: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white border border-secondary-light/60 font-heading font-extrabold text-xl sm:text-2xl text-ink shadow-sm"
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(currentSection.animation?.pegs) && (
                  <div className="grid grid-cols-2 gap-3">
                    {(currentSection.animation.pegs as Array<{ number: number; shape: string }>).map((peg) => (
                      <div
                        key={peg.number}
                        className="p-3 rounded-2xl bg-white border border-secondary-light/60 text-left font-bold text-sm text-ink shadow-sm"
                      >
                        <span className="font-extrabold text-primary-dark">Digit {peg.number}:</span> {peg.shape}
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(currentSection.animation?.loci) && (
                  <div className="space-y-2">
                    {(currentSection.animation.loci as Array<{ order: number; name: string; icon: string }>).map((locus) => (
                      <div
                        key={locus.order}
                        className="p-2.5 rounded-2xl bg-white border border-secondary-light/60 flex items-center gap-3 font-bold text-sm text-ink shadow-sm"
                      >
                        <span className="w-6 h-6 rounded-full bg-accent text-ink font-extrabold text-xs flex items-center justify-center">
                          {locus.order}
                        </span>
                        <span className="text-xl">{locus.icon}</span>
                        <span>{locus.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(currentSection.animation?.acronym) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(currentSection.animation.acronym as Array<{ letter: string; word: string; target: string }>).map((item, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-2xl bg-white border border-secondary-light/60 text-center"
                      >
                        <div className="font-heading font-extrabold text-lg text-accent-dark">
                          {item.letter} = {item.word}
                        </div>
                        <div className="text-xs font-bold text-ink-muted">
                          {item.target}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  nextSection();
                }}
                className="w-full max-w-md py-4 rounded-full bg-primary text-white font-heading font-extrabold text-lg shadow-float hover:bg-primary-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
              >
                <span>Enter Interactive Playground</span> <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* 4. SIMULATION PLAYGROUND */}
          {currentSection?.type === 'simulation' && (
            <SimulationCanvas
              key="simulation"
              config={currentSection.config}
              onComplete={nextSection}
            />
          )}

          {/* 5 & 6 & 7. PRACTICE & RECALL QUESTIONS */}
          {(currentSection?.type === 'practice' || currentSection?.type === 'recall') && currentQuestion && (
            <div key={`q-${currentQuestion.id}`} className="w-full">
              <QuestionCard
                question={currentQuestion}
                hintsRevealed={hintsRevealed}
                onRequestHint={revealHint}
                onSubmit={submitAnswer}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* 8. RESULT & MASTERY COMPLETION */}
          {currentSection?.type === 'result' && completionSummary && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-5xl p-6 sm:p-12 shadow-card border-2 border-secondary-light/60 flex flex-col items-center text-center gap-6"
            >
              <div className="w-20 h-20 rounded-3xl bg-accent-light flex items-center justify-center text-4xl shadow-float animate-bounce-soft">
                👑
              </div>

              <div>
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
                  Mission Accomplished!
                </h2>
                <p className="text-sm font-bold text-ink-muted mt-1">
                  You just strengthened your long-term memory circuits!
                </p>
              </div>

              {/* Mastery Meter */}
              <div className="w-full max-w-md">
                <MasteryMeter
                  score={completionSummary.score}
                  stage={completionSummary.masteryStage}
                />
              </div>

              {/* Rewards Summary Grid */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="p-4 rounded-3xl bg-bg-blue border border-primary/30 text-center">
                  <div className="text-xs font-bold text-ink-muted uppercase">XP Earned</div>
                  <div className="font-heading font-extrabold text-2xl text-primary-dark flex items-center justify-center gap-1 mt-1">
                    <Sparkles className="w-5 h-5 text-accent-dark fill-accent" /> +{completionSummary.xpAwarded} XP
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-bg-lavender border border-secondary/30 text-center">
                  <div className="text-xs font-bold text-ink-muted uppercase">Next Spaced Review</div>
                  <div className="font-heading font-extrabold text-base text-secondary-dark flex items-center justify-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" /> {completionSummary.nextReviewDate}
                  </div>
                </div>
              </div>

              {/* Earned Badges Showcase */}
              {completionSummary.badgesEarned.length > 0 && (
                <div className="w-full max-w-md p-4 rounded-3xl bg-accent-light/40 border border-accent/60">
                  <span className="text-xs font-extrabold text-ink uppercase block mb-2">
                    🏅 New Badge Unlocked!
                  </span>
                  {completionSummary.badgesEarned.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm">
                      <span className="text-3xl">{b.iconKey}</span>
                      <div className="text-left">
                        <div className="font-extrabold text-sm text-ink">{b.name}</div>
                        <div className="text-xs font-bold text-ink-muted">{b.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Back */}
              <div className="flex gap-3 w-full max-w-md pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 py-4 rounded-full bg-primary text-white font-heading font-extrabold text-base shadow-float hover:bg-primary-dark transition-all flex items-center justify-center gap-2 btn-bouncy"
                >
                  <Home className="w-4 h-4" /> Return Home
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/review')}
                  className="flex-1 py-4 rounded-full bg-bg-lavender border border-secondary text-ink font-heading font-extrabold text-base hover:bg-secondary-light/40 transition-all flex items-center justify-center gap-2 btn-bouncy"
                >
                  <RotateCcw className="w-4 h-4" /> Review Queue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Encouraging Feedback Toast */}
      {feedback && (
        <FeedbackToast
          visible={feedback.visible}
          isCorrect={feedback.isCorrect}
          message={feedback.message}
          onNext={() => {
            dismissFeedback();
            nextQuestion();
          }}
        />
      )}
    </div>
  );
}
