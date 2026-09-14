import { MasteryStage } from "@/types/lesson";

export interface MasteryInput {
  accuracy: number;               // 0-1, overall attempt accuracy
  independentAccuracy: number;    // 0-1, questions answered with hints_used === 0
  delayedRecallAccuracy: number;  // 0-1, from recent completed review or current recall stage
  consistency: number;            // 0-1, rolling consistency metric across sessions
}

/**
 * Computes mastery score between 0 and 100 based on the PRD formula:
 * Mastery Score = Accuracy * 40 + Independent Performance * 25 + Delayed Recall * 25 + Consistency * 10
 */
export function computeMasteryScore(input: MasteryInput): number {
  const accuracy = Math.max(0, Math.min(1, input.accuracy));
  const independent = Math.max(0, Math.min(1, input.independentAccuracy));
  const delayedRecall = Math.max(0, Math.min(1, input.delayedRecallAccuracy));
  const consistency = Math.max(0, Math.min(1, input.consistency));

  const score =
    accuracy * 40 +
    independent * 25 +
    delayedRecall * 25 +
    consistency * 10;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Maps numeric score (0-100) to child-friendly 4-stage mastery band
 */
export function masteryStageFor(score: number): MasteryStage {
  if (score >= 85) return "mastered";
  if (score >= 65) return "strong";
  if (score >= 40) return "practising";
  return "discovered";
}

export const MASTERY_STAGE_METADATA: Record<
  MasteryStage,
  { label: string; description: string; color: string; bg: string; icon: string }
> = {
  discovered: {
    label: "Discovered",
    description: "Technique introduced! Beginning the journey.",
    color: "#4E7FBE",
    bg: "#EFF6FC",
    icon: "🌱",
  },
  practising: {
    label: "Practising",
    description: "Building confidence and using hints when needed.",
    color: "#B79FE0",
    bg: "#F3F0FB",
    icon: "⚡",
  },
  strong: {
    label: "Strong",
    description: "Solves problems independently with high accuracy!",
    color: "#FFB27A",
    bg: "#FFF5EC",
    icon: "🔥",
  },
  mastered: {
    label: "Mastered",
    description: "Super recall power! Retained effortlessly over time.",
    color: "#57A87E",
    bg: "#EFFBF4",
    icon: "👑",
  },
};
