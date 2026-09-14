import { z } from "zod";

export const QuestionTypeSchema = z.enum([
  "multiple_choice",
  "single_select",
  "multi_select",
  "drag_drop",
  "matching",
  "ordering",
  "numeric",
  "text_recall",
  "simulation",
  "timed_recall",
]);

export const AgeBandSchema = z.enum(["explorer", "builder", "challenger"]);
export const TechniqueCategorySchema = z.enum([
  "chunking",
  "mnemonics",
  "visual_association",
  "memory_palace",
  "vedic_maths",
]);
export const MasteryStageSchema = z.enum([
  "discovered",
  "practising",
  "strong",
  "mastered",
]);
export const AttemptStatusSchema = z.enum([
  "in_progress",
  "completed",
  "abandoned",
]);
export const ReviewStatusSchema = z.enum([
  "scheduled",
  "completed",
  "missed",
]);

export const QuestionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  image: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
});

export const QuestionPairSchema = z.object({
  left: z.object({ id: z.string(), label: z.string() }),
  right: z.object({ id: z.string(), label: z.string() }),
});

export const QuestionSchema = z.object({
  id: z.string(),
  type: QuestionTypeSchema,
  prompt: z.string(),
  options: z.array(QuestionOptionSchema).optional(),
  pairs: z.array(QuestionPairSchema).optional(),
  answer: z.unknown(),
  difficulty: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  hints: z.array(z.string()),
  supportLevel: z.enum(["guided", "assisted", "independent"]),
});

export const StoryPanelSchema = z.object({
  id: z.number(),
  image: z.string().optional(),
  character: z.enum(["mia", "aarav", "professor_piko", "byte"]).nullable(),
  text: z.string(),
  duration: z.number(),
});

export const SimulationConfigSchema = z.object({
  simulationType: z.enum([
    "chunking",
    "mnemonics",
    "visual_association",
    "memory_palace",
    "vedic_x11",
  ]),
  objects: z.array(z.record(z.unknown())),
  interactions: z.array(z.string()),
  validation: z.record(z.unknown()),
  completionCondition: z.string(),
  meta: z.record(z.unknown()).optional(),
});

export const LessonSectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hook"),
    prompt: z.string(),
    timerSeconds: z.number().optional(),
    subtext: z.string().optional(),
  }),
  z.object({
    type: z.literal("story"),
    panels: z.array(StoryPanelSchema),
  }),
  z.object({
    type: z.literal("explanation"),
    animation: z.record(z.unknown()),
    title: z.string().optional(),
    summary: z.string().optional(),
  }),
  z.object({
    type: z.literal("simulation"),
    config: SimulationConfigSchema,
  }),
  z.object({
    type: z.literal("practice"),
    level: z.enum(["guided", "assisted", "independent"]),
    questions: z.array(QuestionSchema),
  }),
  z.object({
    type: z.literal("recall"),
    questions: z.array(QuestionSchema),
  }),
  z.object({
    type: z.literal("result"),
  }),
]);

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  techniqueCategory: TechniqueCategorySchema,
  ageRange: z.tuple([z.number(), z.number()]),
  badgeOnComplete: z.string().optional(),
  sections: z.array(LessonSectionSchema),
});

export const AnalyticsEventSchema = z.object({
  childId: z.string().optional(),
  eventType: z.enum([
    "lesson_started",
    "story_completed",
    "simulation_started",
    "simulation_completed",
    "question_answered",
    "hint_requested",
    "lesson_completed",
    "recall_completed",
    "badge_earned",
    "review_completed",
    "review_missed",
  ]),
  payload: z.record(z.unknown()).default({}),
});
