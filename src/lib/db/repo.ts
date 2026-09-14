import { loadDb, saveDb } from './store';
import {
  Lesson,
  ChildProfile,
  MasteryStage,
  ReviewScheduleItem,
  Badge,
} from '@/types/lesson';
import { computeMasteryScore, masteryStageFor } from '@/lib/scoring/mastery';
import { calculateNextReview } from '@/lib/spaced-repetition/scheduler';
import crypto from 'crypto';

export function getChildren(parentId = 'parent_default_001'): ChildProfile[] {
  const db = loadDb();
  return db.children.filter((c) => c.parentId === parentId);
}

export function getChild(childId: string): ChildProfile | null {
  const db = loadDb();
  return db.children.find((c) => c.id === childId) || null;
}

export function createChild(
  parentId: string,
  data: { displayName: string; ageBand: string; avatarKey?: string }
): ChildProfile {
  const db = loadDb();
  const id = `child_${crypto.randomUUID().slice(0, 8)}`;
  const newChild: ChildProfile = {
    id,
    parentId,
    displayName: data.displayName,
    ageBand: data.ageBand as ChildProfile['ageBand'],
    avatarKey: data.avatarKey || 'mia',
    preferredLanguage: 'en',
    currentXp: 0,
    currentStreak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  db.children.push(newChild);
  saveDb(db);
  return newChild;
}

export function getLessons(): Array<Omit<Lesson, 'sections'> & { orderIndex: number }> {
  const db = loadDb();
  return db.lessons.map((lesson, index) => ({
    id: lesson.id,
    title: lesson.title,
    subtitle: lesson.subtitle,
    techniqueCategory: lesson.techniqueCategory,
    ageRange: lesson.ageRange,
    badgeOnComplete: lesson.badgeOnComplete,
    orderIndex: index + 1,
  }));
}

export function getLesson(lessonId: string): Lesson | null {
  const db = loadDb();
  return db.lessons.find((l) => l.id === lessonId) || null;
}

export function startAttempt(childId: string, lessonId: string): string {
  const db = loadDb();
  const attemptId = `attempt_${crypto.randomUUID().slice(0, 12)}`;

  db.lesson_attempts.push({
    id: attemptId,
    childId,
    lessonId,
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    completedAt: null,
    score: null,
    accuracy: null,
    hintCount: 0,
    independentAccuracy: null,
    recallAccuracy: null,
  });

  const child = db.children.find((c) => c.id === childId);
  if (child) {
    child.lastActiveDate = new Date().toISOString().split('T')[0];
  }

  saveDb(db);
  return attemptId;
}

export function recordQuestionAttempt(data: {
  attemptId: string;
  questionId: string;
  childId: string;
  answer: unknown;
  correct: boolean;
  hintsUsed: number;
  timeMs: number;
}): void {
  const db = loadDb();
  const id = `qa_${crypto.randomUUID().slice(0, 12)}`;

  db.question_attempts.push({
    id,
    lessonAttemptId: data.attemptId,
    questionId: data.questionId,
    childId: data.childId,
    answer: data.answer,
    correct: data.correct,
    hintsUsed: data.hintsUsed,
    timeMs: data.timeMs,
    attemptNumber: 1,
    createdAt: new Date().toISOString(),
  });

  saveDb(db);
}

export function completeAttempt(attemptId: string): {
  score: number;
  masteryStage: MasteryStage;
  xpAwarded: number;
  badgesEarned: Badge[];
  nextReviewDate: string;
} {
  const db = loadDb();
  const attempt = db.lesson_attempts.find((a) => a.id === attemptId);

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  const qAttempts = db.question_attempts.filter((q) => q.lessonAttemptId === attemptId);
  const totalQuestions = Math.max(1, qAttempts.length);
  const correctCount = qAttempts.filter((q) => q.correct).length;
  const accuracy = correctCount / totalQuestions;

  const independentQuestions = qAttempts.filter((q) => q.hintsUsed === 0);
  const independentAccuracy =
    independentQuestions.length > 0
      ? independentQuestions.filter((q) => q.correct).length / independentQuestions.length
      : 0.5;

  const totalHints = qAttempts.reduce((acc, q) => acc + q.hintsUsed, 0);

  // Compute mastery score using server-side formula (Section 15.1)
  const score = computeMasteryScore({
    accuracy,
    independentAccuracy,
    delayedRecallAccuracy: accuracy,
    consistency: 0.8,
  });

  const stage = masteryStageFor(score);

  // Update attempt record
  attempt.status = 'completed';
  attempt.completedAt = new Date().toISOString();
  attempt.score = score;
  attempt.accuracy = accuracy;
  attempt.hintCount = totalHints;
  attempt.independentAccuracy = independentAccuracy;

  // Upsert mastery record
  let mastery = db.mastery_records.find(
    (m) => m.childId === attempt.childId && m.lessonId === attempt.lessonId
  );

  if (!mastery) {
    mastery = {
      id: `m_${crypto.randomUUID().slice(0, 8)}`,
      childId: attempt.childId,
      lessonId: attempt.lessonId,
      masteryScore: score,
      masteryStage: stage,
      history: [],
      updatedAt: new Date().toISOString(),
    };
    db.mastery_records.push(mastery);
  }

  mastery.masteryScore = score;
  mastery.masteryStage = stage;
  mastery.history.push({ score, stage, at: new Date().toISOString() });
  mastery.updatedAt = new Date().toISOString();

  // Schedule review (Section 10 & 15.2)
  const nextReview = calculateNextReview(0, score, 1);
  const reviewId = `rev_${crypto.randomUUID().slice(0, 10)}`;
  db.review_schedule.push({
    id: reviewId,
    childId: attempt.childId,
    lessonId: attempt.lessonId,
    reviewNumber: 1,
    scheduledFor: nextReview.scheduledDate,
    completedAt: null,
    performanceScore: null,
    status: 'scheduled',
  });

  // Award XP
  const baseXP = 50;
  const independentBonusXP = Math.round(independentAccuracy * 30);
  const totalXpAwarded = baseXP + independentBonusXP;

  db.xp_events.push({
    id: `xp_${crypto.randomUUID().slice(0, 8)}`,
    childId: attempt.childId,
    sourceType: 'lesson_complete',
    sourceId: attempt.lessonId,
    xpAmount: totalXpAwarded,
    createdAt: new Date().toISOString(),
  });

  const child = db.children.find((c) => c.id === attempt.childId);
  if (child) {
    child.currentXp += totalXpAwarded;
  }

  // Award badge if applicable
  const badgesEarned: Badge[] = [];
  const lesson = getLesson(attempt.lessonId);
  if (lesson?.badgeOnComplete) {
    const badge = db.badges.find((b) => b.id === lesson.badgeOnComplete);
    if (badge) {
      const alreadyEarned = db.user_badges.some(
        (ub) => ub.childId === attempt.childId && ub.badgeId === badge.id
      );
      if (!alreadyEarned) {
        db.user_badges.push({
          id: `ub_${crypto.randomUUID().slice(0, 8)}`,
          childId: attempt.childId,
          badgeId: badge.id,
          earnedAt: new Date().toISOString(),
        });
        badgesEarned.push(badge);
      }
    }
  }

  saveDb(db);

  return {
    score,
    masteryStage: stage,
    xpAwarded: totalXpAwarded,
    badgesEarned,
    nextReviewDate: nextReview.scheduledDate,
  };
}

export function getChildProgress(childId: string) {
  const db = loadDb();
  const child = db.children.find((c) => c.id === childId);
  if (!child) return null;

  const lessonsMap = new Map(db.lessons.map((l) => [l.id, l]));

  const masteryList = db.mastery_records
    .filter((m) => m.childId === childId)
    .map((m) => {
      const lesson = lessonsMap.get(m.lessonId);
      return {
        lessonId: m.lessonId,
        masteryScore: m.masteryScore,
        masteryStage: m.masteryStage,
        updatedAt: m.updatedAt,
        lessonTitle: lesson?.title || m.lessonId,
        techniqueCategory: lesson?.techniqueCategory || 'vedic_maths',
      };
    });

  const badges = db.user_badges
    .filter((ub) => ub.childId === childId)
    .map((ub) => {
      const badge = db.badges.find((b) => b.id === ub.badgeId);
      return {
        id: ub.badgeId,
        name: badge?.name || ub.badgeId,
        description: badge?.description || '',
        iconKey: badge?.iconKey || '⭐',
        earnedAt: ub.earnedAt,
      };
    });

  const completedCount = db.lesson_attempts.filter(
    (a) => a.childId === childId && a.status === 'completed'
  ).length;

  return {
    child,
    lessons: masteryList,
    badges,
    completedLessonsCount: completedCount,
  };
}

export function getChildReviews(childId: string): ReviewScheduleItem[] {
  const db = loadDb();
  const lessonsMap = new Map(db.lessons.map((l) => [l.id, l]));

  return db.review_schedule
    .filter((r) => r.childId === childId)
    .map((r) => {
      const lesson = lessonsMap.get(r.lessonId);
      return {
        ...r,
        lessonTitle: lesson?.title || r.lessonId,
        techniqueCategory: lesson?.techniqueCategory || 'vedic_maths',
      };
    });
}

export function completeReview(reviewId: string, performanceScore: number) {
  const db = loadDb();
  const review = db.review_schedule.find((r) => r.id === reviewId);
  if (!review) throw new Error('Review not found');

  review.status = 'completed';
  review.completedAt = new Date().toISOString();
  review.performanceScore = performanceScore;

  const nextCalc = calculateNextReview(review.reviewNumber, performanceScore, 3);
  const nextReviewId = `rev_${crypto.randomUUID().slice(0, 10)}`;

  db.review_schedule.push({
    id: nextReviewId,
    childId: review.childId,
    lessonId: review.lessonId,
    reviewNumber: review.reviewNumber + 1,
    scheduledFor: nextCalc.scheduledDate,
    completedAt: null,
    performanceScore: null,
    status: 'scheduled',
  });

  const mastery = db.mastery_records.find(
    (m) => m.childId === review.childId && m.lessonId === review.lessonId
  );

  let newScore = performanceScore;
  if (mastery) {
    newScore = Math.round(mastery.masteryScore * 0.6 + performanceScore * 0.4);
    const stage = masteryStageFor(newScore);
    mastery.masteryScore = newScore;
    mastery.masteryStage = stage;
    mastery.history.push({ score: newScore, stage, at: new Date().toISOString() });
    mastery.updatedAt = new Date().toISOString();
  }

  const xpAmount = Math.round(performanceScore * 0.4) + 20;
  db.xp_events.push({
    id: `xp_${crypto.randomUUID().slice(0, 8)}`,
    childId: review.childId,
    sourceType: 'review_complete',
    sourceId: review.lessonId,
    xpAmount,
    createdAt: new Date().toISOString(),
  });

  const child = db.children.find((c) => c.id === review.childId);
  if (child) {
    child.currentXp += xpAmount;
  }

  saveDb(db);

  return {
    nextIntervalDays: nextCalc.intervalDays,
    nextReviewDate: nextCalc.scheduledDate,
    newMasteryStage: masteryStageFor(newScore),
    xpAwarded: xpAmount,
  };
}

export function recordAnalytics(
  childId: string | undefined,
  eventType: string,
  payload: Record<string, unknown> = {}
) {
  const db = loadDb();
  db.analytics_events.push({
    id: `evt_${crypto.randomUUID().slice(0, 12)}`,
    childId: childId || null,
    eventType,
    eventPayload: payload,
    createdAt: new Date().toISOString(),
  });
  saveDb(db);
}
