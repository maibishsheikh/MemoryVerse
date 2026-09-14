import { create } from 'zustand';
import { Lesson, LessonSection, Question, Badge, MasteryStage } from '@/types/lesson';
import { soundFx } from '@/lib/audio/sound-effects';
import confetti from 'canvas-confetti';

export interface CompletionSummary {
  score: number;
  masteryStage: MasteryStage;
  xpAwarded: number;
  badgesEarned: Badge[];
  nextReviewDate: string;
}

interface LessonState {
  lesson: Lesson | null;
  attemptId: string | null;
  childId: string | null;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  hintsRevealed: number;
  hintsUsedInCurrentQuestion: number;
  totalHintsUsed: number;
  questionResults: Record<string, { correct: boolean; hintsUsed: number; timeMs: number }>;
  simulationCompleted: boolean;
  isSubmitting: boolean;
  feedback: { visible: boolean; message: string; isCorrect: boolean } | null;
  completionSummary: CompletionSummary | null;
  startTime: number;
  questionStartTime: number;

  initLesson: (lesson: Lesson, childId: string) => Promise<void>;
  getCurrentSection: () => LessonSection | null;
  getCurrentQuestion: () => Question | null;
  revealHint: () => void;
  submitAnswer: (answer: unknown) => Promise<boolean>;
  setSimulationCompleted: (completed: boolean) => void;
  nextSection: () => void;
  prevSection: () => void;
  nextQuestion: () => void;
  finishLesson: () => Promise<void>;
  resetLesson: () => void;
  dismissFeedback: () => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  lesson: null,
  attemptId: null,
  childId: null,
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  hintsRevealed: 0,
  hintsUsedInCurrentQuestion: 0,
  totalHintsUsed: 0,
  questionResults: {},
  simulationCompleted: false,
  isSubmitting: false,
  feedback: null,
  completionSummary: null,
  startTime: Date.now(),
  questionStartTime: Date.now(),

  initLesson: async (lesson, childId) => {
    set({
      lesson,
      childId,
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      hintsRevealed: 0,
      hintsUsedInCurrentQuestion: 0,
      totalHintsUsed: 0,
      questionResults: {},
      simulationCompleted: false,
      feedback: null,
      completionSummary: null,
      startTime: Date.now(),
      questionStartTime: Date.now(),
    });

    try {
      const res = await fetch(`/api/lessons/${lesson.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ attemptId: data.attemptId });
      }
    } catch (err) {
      console.error('Failed to start lesson attempt:', err);
    }
  },

  getCurrentSection: () => {
    const { lesson, currentSectionIndex } = get();
    if (!lesson || !lesson.sections[currentSectionIndex]) return null;
    return lesson.sections[currentSectionIndex];
  },

  getCurrentQuestion: () => {
    const section = get().getCurrentSection();
    if (!section) return null;
    if (section.type === 'practice' || section.type === 'recall') {
      return section.questions[get().currentQuestionIndex] || null;
    }
    return null;
  },

  revealHint: () => {
    const q = get().getCurrentQuestion();
    if (!q || !q.hints || q.hints.length === 0) return;
    if (get().hintsRevealed < q.hints.length) {
      soundFx.playHint();
      set((s) => ({
        hintsRevealed: s.hintsRevealed + 1,
        hintsUsedInCurrentQuestion: s.hintsUsedInCurrentQuestion + 1,
        totalHintsUsed: s.totalHintsUsed + 1,
      }));
    }
  },

  submitAnswer: async (answer: unknown) => {
    const { attemptId, childId, questionStartTime, hintsUsedInCurrentQuestion } = get();
    const q = get().getCurrentQuestion();
    if (!q || !attemptId || !childId) return false;

    set({ isSubmitting: true });

    // Local evaluation check
    let isCorrect = false;
    if (typeof q.answer === 'number' || typeof q.answer === 'string') {
      isCorrect = String(answer).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
    } else if (Array.isArray(q.answer)) {
      isCorrect = JSON.stringify(answer) === JSON.stringify(q.answer);
    } else if (typeof q.answer === 'object' && q.answer !== null) {
      isCorrect = JSON.stringify(answer) === JSON.stringify(q.answer);
    }

    const timeSpent = Math.max(500, Date.now() - questionStartTime);

    if (isCorrect) {
      soundFx.playSuccess();
    } else {
      soundFx.playGentleError();
    }

    // Call API route
    try {
      await fetch(`/api/attempts/${attemptId}/questions/${q.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          answer,
          correct: isCorrect,
          hintsUsed: hintsUsedInCurrentQuestion,
          timeMs: timeSpent,
        }),
      });
    } catch (err) {
      console.error('Error submitting question attempt:', err);
    }

    set((s) => ({
      isSubmitting: false,
      questionResults: {
        ...s.questionResults,
        [q.id]: { correct: isCorrect, hintsUsed: hintsUsedInCurrentQuestion, timeMs: timeSpent },
      },
      feedback: {
        visible: true,
        isCorrect,
        message: isCorrect
          ? hintsUsedInCurrentQuestion === 0
            ? '⚡ Perfect! Answered independently without any hints!'
            : '⭐ Awesome recall! You spotted the secret pattern!'
          : 'Almost there! Take a breath, check your mental image, and try again!',
      },
    }));

    return isCorrect;
  },

  dismissFeedback: () => {
    set({ feedback: null });
  },

  setSimulationCompleted: (completed) => {
    if (completed) soundFx.playSuccess();
    set({ simulationCompleted: completed });
  },

  nextQuestion: () => {
    const section = get().getCurrentSection();
    if (!section || (section.type !== 'practice' && section.type !== 'recall')) return;

    if (get().currentQuestionIndex < section.questions.length - 1) {
      set((s) => ({
        currentQuestionIndex: s.currentQuestionIndex + 1,
        hintsRevealed: 0,
        hintsUsedInCurrentQuestion: 0,
        feedback: null,
        questionStartTime: Date.now(),
      }));
    } else {
      // Proceed to next section
      get().nextSection();
    }
  },

  nextSection: () => {
    const { lesson, currentSectionIndex } = get();
    if (!lesson) return;

    if (currentSectionIndex < lesson.sections.length - 1) {
      soundFx.playPop();
      const nextIdx = currentSectionIndex + 1;
      const nextSec = lesson.sections[nextIdx];

      set({
        currentSectionIndex: nextIdx,
        currentQuestionIndex: 0,
        hintsRevealed: 0,
        hintsUsedInCurrentQuestion: 0,
        feedback: null,
        simulationCompleted: false,
        questionStartTime: Date.now(),
      });

      if (nextSec.type === 'result') {
        get().finishLesson();
      }
    }
  },

  prevSection: () => {
    const { currentSectionIndex } = get();
    if (currentSectionIndex > 0) {
      soundFx.playPop();
      set({
        currentSectionIndex: currentSectionIndex - 1,
        currentQuestionIndex: 0,
        hintsRevealed: 0,
        feedback: null,
      });
    }
  },

  finishLesson: async () => {
    const { attemptId } = get();
    if (!attemptId) return;

    try {
      const res = await fetch(`/api/attempts/${attemptId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data: CompletionSummary = await res.json();
        set({ completionSummary: data });
        soundFx.playCelebration();
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#6C9BD8', '#B79FE0', '#FFC85C', '#7BC9A0', '#FFB27A'],
          });
        } catch {}
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  },

  resetLesson: () => {
    set({
      lesson: null,
      attemptId: null,
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      hintsRevealed: 0,
      hintsUsedInCurrentQuestion: 0,
      totalHintsUsed: 0,
      questionResults: {},
      simulationCompleted: false,
      feedback: null,
      completionSummary: null,
    });
  },
}));
