export type QuestionType =
  | "multiple_choice"
  | "single_select"
  | "multi_select"
  | "drag_drop"
  | "matching"
  | "ordering"
  | "numeric"
  | "text_recall"
  | "simulation"
  | "timed_recall";

export type AgeBand = "explorer" | "builder" | "challenger";
export type TechniqueCategory = "chunking" | "mnemonics" | "visual_association" | "memory_palace" | "vedic_maths";
export type MasteryStage = "discovered" | "practising" | "strong" | "mastered";
export type AttemptStatus = "in_progress" | "completed" | "abandoned";
export type ReviewStatus = "scheduled" | "completed" | "missed";
export type XPSource = "lesson_complete" | "independent_answer" | "recall_success" | "review_complete";

export interface QuestionOption {
  id: string;
  label: string;
  image?: string;
  meta?: Record<string, unknown>;
}

export interface Question {
  id: string;                 // stable, e.g. "q001"
  type: QuestionType;
  prompt: string;
  options?: QuestionOption[];   // for choice/select/matching/ordering
  pairs?: { left: { id: string; label: string }; right: { id: string; label: string } }[]; // for matching
  answer: unknown;            // shape depends on type
  difficulty: 1 | 2 | 3 | 4 | 5;
  hints: string[];            // ordered, revealed one at a time
  supportLevel: "guided" | "assisted" | "independent";
}

export type CharacterName = "mia" | "aarav" | "professor_piko" | "byte" | null;

export interface StoryPanel {
  id: number;
  image?: string;               // path or vector identifier
  character: CharacterName;
  text: string;
  duration: number;            // seconds, auto-narration pacing; child can always advance manually
}

export interface SimulationConfig {
  simulationType: "chunking" | "mnemonics" | "visual_association" | "memory_palace" | "vedic_x11";
  objects: Record<string, unknown>[];
  interactions: string[];
  validation: Record<string, unknown>;
  completionCondition: string;
  meta?: Record<string, unknown>;
}

export type LessonSection =
  | { type: "hook"; prompt: string; timerSeconds?: number; subtext?: string }
  | { type: "story"; panels: StoryPanel[] }
  | { type: "explanation"; animation: Record<string, unknown>; title?: string; summary?: string }
  | { type: "simulation"; config: SimulationConfig }
  | { type: "practice"; level: "guided" | "assisted" | "independent"; questions: Question[] }
  | { type: "recall"; questions: Question[] }
  | { type: "result" };

export interface Lesson {
  id: string;                          // matches DB lessons.id and filename
  title: string;
  subtitle?: string;
  techniqueCategory: TechniqueCategory;
  ageRange: [number, number];
  badgeOnComplete?: string;            // badge id from badges table
  sections: LessonSection[];
}

export interface ChildProfile {
  id: string;
  parentId: string;
  displayName: string;
  ageBand: AgeBand;
  avatarKey: string;
  preferredLanguage: string;
  currentXp: number;
  currentStreak: number;
  lastActiveDate: string | null;
  createdAt: string;
}

export interface ParentProfile {
  id: string;
  displayName: string;
  createdAt: string;
}

export interface MasteryRecord {
  id: string;
  childId: string;
  lessonId: string;
  masteryScore: number;
  masteryStage: MasteryStage;
  history: { score: number; stage: MasteryStage; at: string }[];
  updatedAt: string;
}

export interface ReviewScheduleItem {
  id: string;
  childId: string;
  lessonId: string;
  lessonTitle?: string;
  techniqueCategory?: TechniqueCategory;
  reviewNumber: number;
  scheduledFor: string;
  completedAt: string | null;
  performanceScore: number | null;
  status: ReviewStatus;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconKey: string;
  criteria: Record<string, unknown>;
}

export interface UserBadge {
  id: string;
  childId: string;
  badgeId: string;
  earnedAt: string;
  badge?: Badge;
}
