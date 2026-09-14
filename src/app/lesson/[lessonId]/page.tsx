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
import CountdownRing from '@/components/ui/CountdownRing';
import XPCounter from '@/components/ui/XPCounter';
import StarRating from '@/components/ui/StarRating';
import SceneBackground from '@/components/ui/SceneBackground';
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
  Lock,
  Unlock,
  Zap,
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
    totalHintsUsed,
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
  const [hookTimerTotal, setHookTimerTotal] = useState(20);
  const [hookRevealed, setHookRevealed] = useState(false);

  // Explanation step-by-step state
  const [explanationStep, setExplanationStep] = useState(0);
  const [explanationAutoPlay, setExplanationAutoPlay] = useState(true);

  // Result animation state
  const [resultPhase, setResultPhase] = useState<'stars' | 'xp' | 'badges' | 'done'>('stars');

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
      setHookTimerTotal(section.timerSeconds);
      setHookTimer(section.timerSeconds);
      setHookRevealed(false);
      const interval = setInterval(() => {
        setHookTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setHookRevealed(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSectionIndex, getCurrentSection]);

  // Explanation auto-play
  useEffect(() => {
    const section = getCurrentSection();
    if (section?.type === 'explanation' && explanationAutoPlay) {
      setExplanationStep(0);
      const steps = getExplanationItems(section);
      if (steps.length <= 1) return;

      const interval = setInterval(() => {
        setExplanationStep((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 2200);
      return () => clearInterval(interval);
    }
  }, [currentSectionIndex, explanationAutoPlay]);

  // Result phase sequence
  useEffect(() => {
    if (completionSummary) {
      setResultPhase('stars');
      setTimeout(() => setResultPhase('xp'), 1200);
      setTimeout(() => setResultPhase('badges'), 2800);
      setTimeout(() => setResultPhase('done'), 3500);
    }
  }, [completionSummary]);

  // Helper to extract explanation steps
  function getExplanationItems(section: any): string[] {
    if (Array.isArray(section.animation?.steps)) return section.animation.steps;
    if (Array.isArray(section.animation?.pegs)) {
      return section.animation.pegs.map((p: any) => `Digit ${p.number}: ${p.shape}`);
    }
    if (Array.isArray(section.animation?.loci)) {
      return section.animation.loci.map((l: any) => `${l.icon} ${l.name}`);
    }
    if (Array.isArray(section.animation?.acronym)) {
      return section.animation.acronym.map((a: any) => `${a.letter} = ${a.word} → ${a.target}`);
    }
    return [];
  }

  function getPerformanceStars(): 1 | 2 | 3 {
    if (!completionSummary) return 1;
    if (completionSummary.score >= 90 && totalHintsUsed === 0) return 3;
    if (completionSummary.score >= 70) return 2;
    return 1;
  }

  if (loading || !lesson) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent"
        />
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

          {/* ═══════════ 1. HOOK STAGE — Dramatic Challenge ═══════════ */}
          {currentSection?.type === 'hook' && (
            <motion.div
              key="hook"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            >
              <SceneBackground scene="space" intensity="vivid" className="w-full">
                <div className="p-6 sm:p-12 flex flex-col items-center text-center gap-6">
                  {/* Challenge badge */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-extrabold text-white shadow-sm"
                  >
                    {hookRevealed ? (
                      <><Unlock className="w-4 h-4 text-accent" /> Challenge Unlocked</>
                    ) : (
                      <><Lock className="w-4 h-4 text-accent animate-pulse" /> Curiosity Challenge</>
                    )}
                  </motion.div>

                  {/* Challenge title with dramatic entrance */}
                  <motion.h2
                    initial={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
                    animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 18 }}
                    className="font-heading font-extrabold text-3xl sm:text-4xl text-white max-w-xl leading-tight drop-shadow-lg"
                  >
                    {currentSection.prompt}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm font-bold text-white/70 max-w-md"
                  >
                    {currentSection.subtext || 'Take a quick attempt before the clock runs out!'}
                  </motion.p>

                  {/* Countdown Ring */}
                  {currentSection.timerSeconds && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 250, damping: 18 }}
                    >
                      <CountdownRing
                        totalSeconds={hookTimerTotal}
                        remainingSeconds={hookTimer}
                        size={120}
                        strokeWidth={8}
                      />
                    </motion.div>
                  )}

                  {/* Quick input */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="w-full max-w-xs space-y-3"
                  >
                    <input
                      type="text"
                      value={hookAnswer}
                      onChange={(e) => setHookAnswer(e.target.value)}
                      placeholder="Your guess..."
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-center font-heading font-extrabold text-2xl text-white placeholder-white/30 focus:outline-none focus:border-accent shadow-sm"
                    />

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        soundFx.playPop();
                        nextSection();
                      }}
                      className="w-full py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-ink font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
                    >
                      <Sparkles className="w-5 h-5" /> Discover the Secret <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                </div>
              </SceneBackground>
            </motion.div>
          )}

          {/* ═══════════ 2. STORY STAGE ═══════════ */}
          {currentSection?.type === 'story' && (
            <StoryPanel
              key="story"
              panels={currentSection.panels}
              onComplete={nextSection}
            />
          )}

          {/* ═══════════ 3. EXPLANATION — Animated Step Reveal ═══════════ */}
          {currentSection?.type === 'explanation' && (
            <motion.div
              key="explanation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/95 rounded-5xl p-6 sm:p-10 shadow-card border-2 border-secondary-light/60 flex flex-col items-center text-center gap-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bg-blue text-primary-dark font-extrabold text-xs shadow-sm">
                💡 Mental Model
              </div>

              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
                {currentSection.title || 'How the Secret Works'}
              </h2>

              <p className="text-base font-bold text-ink-muted max-w-xl">
                {currentSection.summary}
              </p>

              {/* Step-by-step animated reveal */}
              <div className="w-full max-w-lg rounded-4xl bg-gradient-to-tr from-bg-lavender via-white to-bg-blue border-2 border-secondary-light/40 shadow-inner p-6 sm:p-8">
                <div className="space-y-3 slide-up-stagger">
                  {getExplanationItems(currentSection).map((step: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={
                        idx <= explanationStep
                          ? { opacity: 1, x: 0, scale: 1 }
                          : { opacity: 0.2, x: 0, scale: 0.95 }
                      }
                      transition={{ delay: idx * 0.1, type: 'spring', stiffness: 250, damping: 20 }}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        idx <= explanationStep
                          ? 'bg-white border-primary/30 shadow-sm'
                          : 'bg-white/50 border-secondary-light/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        idx <= explanationStep
                          ? 'bg-primary text-white'
                          : 'bg-secondary-light/30 text-ink-muted/40'
                      }`}>
                        {idx < explanationStep ? '✓' : idx + 1}
                      </div>
                      <span className={`font-heading font-extrabold text-lg sm:text-xl text-left ${
                        idx <= explanationStep ? 'text-ink' : 'text-ink-muted/40'
                      }`}>
                        {step}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Step navigation dots */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  {getExplanationItems(currentSection).map((_: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => { setExplanationAutoPlay(false); setExplanationStep(idx); }}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === explanationStep
                          ? 'w-6 bg-primary'
                          : idx < explanationStep
                          ? 'bg-success'
                          : 'bg-secondary-light/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  soundFx.playPop();
                  nextSection();
                }}
                className="w-full max-w-md py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-lg shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
              >
                <Zap className="w-5 h-5" /> Enter Interactive Playground <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* ═══════════ 4. SIMULATION PLAYGROUND ═══════════ */}
          {currentSection?.type === 'simulation' && (
            <SimulationCanvas
              key="simulation"
              config={currentSection.config}
              onComplete={nextSection}
            />
          )}

          {/* ═══════════ 5 & 6 & 7. PRACTICE & RECALL QUESTIONS ═══════════ */}
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

          {/* ═══════════ 8. RESULT — Epic Victory Celebration ═══════════ */}
          {currentSection?.type === 'result' && completionSummary && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <SceneBackground scene="garden" intensity="vivid" className="w-full">
                <div className="p-6 sm:p-12 flex flex-col items-center text-center gap-6">
                  {/* Trophy entrance */}
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                    className="w-24 h-24 rounded-3xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-5xl shadow-dramatic border-2 border-accent/40"
                  >
                    👑
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
                      Mission Accomplished!
                    </h2>
                    <p className="text-sm font-bold text-ink-muted mt-1">
                      You just strengthened your long-term memory circuits!
                    </p>
                  </motion.div>

                  {/* Star Rating — Phase 1 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={resultPhase !== 'stars' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 250, damping: 18 }}
                  >
                    <StarRating stars={getPerformanceStars()} size={60} />
                  </motion.div>

                  {/* Always show stars after initial animation */}
                  {resultPhase !== 'stars' && (
                    <StarRating stars={getPerformanceStars()} size={60} />
                  )}

                  {/* XP Counter — Phase 2 */}
                  {(resultPhase === 'xp' || resultPhase === 'badges' || resultPhase === 'done') && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <XPCounter targetXP={completionSummary.xpAwarded} duration={1500} />
                    </motion.div>
                  )}

                  {/* Mastery Meter */}
                  {(resultPhase === 'badges' || resultPhase === 'done') && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full max-w-md"
                    >
                      <MasteryMeter
                        score={completionSummary.score}
                        stage={completionSummary.masteryStage}
                      />
                    </motion.div>
                  )}

                  {/* Stats Grid */}
                  {(resultPhase === 'badges' || resultPhase === 'done') && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="grid grid-cols-2 gap-4 w-full max-w-md"
                    >
                      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-sm border border-secondary-light/40 text-center shadow-sm">
                        <div className="text-xs font-bold text-ink-muted uppercase">Mastery</div>
                        <div className="font-heading font-extrabold text-2xl text-primary-dark mt-1 capitalize">
                          {completionSummary.masteryStage}
                        </div>
                      </div>
                      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-sm border border-secondary-light/40 text-center shadow-sm">
                        <div className="text-xs font-bold text-ink-muted uppercase">Next Review</div>
                        <div className="font-heading font-extrabold text-base text-secondary-dark flex items-center justify-center gap-1 mt-1">
                          <Calendar className="w-4 h-4" /> {completionSummary.nextReviewDate}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Badges */}
                  {resultPhase === 'done' && completionSummary.badgesEarned.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full max-w-md p-4 rounded-3xl bg-accent-light/30 backdrop-blur-sm border border-accent/40 shadow-sm"
                    >
                      <span className="text-xs font-extrabold text-ink uppercase block mb-2">
                        🏅 New Badge Unlocked!
                      </span>
                      {completionSummary.badgesEarned.map((b) => (
                        <motion.div
                          key={b.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center gap-3 bg-white/90 p-3 rounded-2xl shadow-sm"
                        >
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                            className="text-3xl"
                          >
                            {b.iconKey}
                          </motion.span>
                          <div className="text-left">
                            <div className="font-extrabold text-sm text-ink">{b.name}</div>
                            <div className="text-xs font-bold text-ink-muted">{b.description}</div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Navigation */}
                  {resultPhase === 'done' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex gap-3 w-full max-w-md pt-2"
                    >
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/')}
                        className="flex-1 py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-extrabold text-base shadow-float hover:shadow-lg transition-all flex items-center justify-center gap-2 btn-bouncy"
                      >
                        <Home className="w-4 h-4" /> Return Home
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/review')}
                        className="flex-1 py-4 rounded-full bg-white/80 backdrop-blur-sm border border-secondary/40 text-ink font-heading font-extrabold text-base hover:bg-white transition-all flex items-center justify-center gap-2 btn-bouncy shadow-sm"
                      >
                        <RotateCcw className="w-4 h-4" /> Review Queue
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </SceneBackground>
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
