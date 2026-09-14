import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const QuestionTypeSchema = z.enum([
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

const QuestionSchema = z.object({
  id: z.string(),
  type: QuestionTypeSchema,
  prompt: z.string(),
  options: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  pairs: z.array(z.object({
    left: z.object({ id: z.string(), label: z.string() }),
    right: z.object({ id: z.string(), label: z.string() })
  })).optional(),
  answer: z.unknown(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  hints: z.array(z.string()),
  supportLevel: z.enum(["guided", "assisted", "independent"]),
});

const StoryPanelSchema = z.object({
  id: z.number(),
  image: z.string().optional(),
  character: z.enum(["mia", "aarav", "professor_piko", "byte"]).nullable(),
  text: z.string(),
  duration: z.number(),
});

const SimulationConfigSchema = z.object({
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
});

const LessonSectionSchema = z.discriminatedUnion("type", [
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

const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  techniqueCategory: z.enum([
    "chunking",
    "mnemonics",
    "visual_association",
    "memory_palace",
    "vedic_maths",
  ]),
  ageRange: z.tuple([z.number(), z.number()]),
  badgeOnComplete: z.string().optional(),
  sections: z.array(LessonSectionSchema),
});

const contentDir = path.join(process.cwd(), 'src', 'content', 'lessons');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));

console.log(`🔍 Validating ${files.length} lesson content files against Zod schema...`);

let hasErrors = false;

for (const file of files) {
  const fullPath = path.join(contentDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  try {
    const json = JSON.parse(raw);
    const parsed = LessonSchema.safeParse(json);
    if (!parsed.success) {
      console.error(`❌ Validation failed for ${file}:`, parsed.error.format());
      hasErrors = true;
    } else {
      console.log(`✅ ${file}: Validated successfully (${parsed.data.sections.length} sections)`);
    }
  } catch (err) {
    console.error(`❌ JSON Syntax error in ${file}:`, err);
    hasErrors = true;
  }
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log('🎉 All lesson files passed strict schema validation!');
}
