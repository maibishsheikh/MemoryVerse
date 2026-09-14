export const DEFAULT_REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];

export interface NextReviewCalculation {
  intervalDays: number;
  scheduledDate: string;
  supportLevel: "guided" | "independent";
}

/**
 * Calculates next review interval and scheduled date using adaptive SRS algorithm
 */
export function calculateNextReview(
  reviewNumber: number,
  lastPerformanceScore: number,
  lastIntervalDays: number = 1
): NextReviewCalculation {
  let intervalDays: number;
  let supportLevel: "guided" | "independent" = "independent";

  if (lastPerformanceScore < 60) {
    // Forgotten or struggled — pull review closer and restore guided support
    intervalDays = Math.max(1, Math.round(lastIntervalDays / 2));
    supportLevel = "guided";
  } else if (lastPerformanceScore >= 90) {
    // Mastered with ease — push interval further out
    intervalDays = Math.max(2, Math.round(lastIntervalDays * 1.5));
  } else {
    // Standard progression
    const defaultIndex = Math.min(reviewNumber, DEFAULT_REVIEW_INTERVALS_DAYS.length - 1);
    intervalDays = DEFAULT_REVIEW_INTERVALS_DAYS[defaultIndex] ?? Math.round(lastIntervalDays * 1.5);
  }

  const now = new Date();
  now.setDate(now.getDate() + intervalDays);
  const scheduledDate = now.toISOString().split("T")[0];

  return {
    intervalDays,
    scheduledDate,
    supportLevel,
  };
}
