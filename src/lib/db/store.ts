import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  Lesson,
  ChildProfile,
  ParentProfile,
  MasteryRecord,
  ReviewScheduleItem,
  Badge,
  UserBadge,
  MasteryStage,
} from '@/types/lesson';

// Statically import all curriculum lessons so they are bundled into serverless builds
import chunkingData from '@/content/lessons/chunking.json';
import memoryPalaceData from '@/content/lessons/memory-palace.json';
import mnemonicsData from '@/content/lessons/mnemonics.json';
import vedicX11Data from '@/content/lessons/vedic-x11.json';
import visualAssociationData from '@/content/lessons/visual-association.json';

const ALL_STATIC_LESSONS: Lesson[] = [
  vedicX11Data as unknown as Lesson,
  visualAssociationData as unknown as Lesson,
  memoryPalaceData as unknown as Lesson,
  chunkingData as unknown as Lesson,
  mnemonicsData as unknown as Lesson,
];

export interface LessonAttemptRecord {
  id: string;
  childId: string;
  lessonId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  accuracy: number | null;
  hintCount: number;
  independentAccuracy: number | null;
  recallAccuracy: number | null;
}

export interface QuestionAttemptRecord {
  id: string;
  lessonAttemptId: string;
  questionId: string;
  childId: string;
  answer: unknown;
  correct: boolean;
  hintsUsed: number;
  timeMs: number;
  attemptNumber: number;
  createdAt: string;
}

export interface XPEvent {
  id: string;
  childId: string;
  sourceType: 'lesson_complete' | 'independent_answer' | 'recall_success' | 'review_complete';
  sourceId: string | null;
  xpAmount: number;
  createdAt: string;
}

export interface AnalyticsEventRecord {
  id: string;
  childId: string | null;
  eventType: string;
  eventPayload: Record<string, unknown>;
  createdAt: string;
}

export interface DbSchema {
  parent_profiles: ParentProfile[];
  children: ChildProfile[];
  lessons: Lesson[];
  lesson_attempts: LessonAttemptRecord[];
  question_attempts: QuestionAttemptRecord[];
  mastery_records: MasteryRecord[];
  review_schedule: ReviewScheduleItem[];
  badges: Badge[];
  user_badges: UserBadge[];
  xp_events: XPEvent[];
  analytics_events: AnalyticsEventRecord[];
}

function getDbFilePath(): string {
  // On Vercel or AWS Lambda, the root is read-only; use /tmp which is writable
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), 'memory_db.json');
  }

  // Locally, attempt to use the data/ directory with fallback to /tmp
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return path.join(localDir, 'memory_db.json');
  } catch {
    return path.join(os.tmpdir(), 'memory_db.json');
  }
}

function getDefaultDb(): DbSchema {
  return {
    parent_profiles: [
      {
        id: 'parent_default_001',
        displayName: 'Alex (Parent)',
        createdAt: new Date().toISOString(),
      },
    ],
    children: [
      {
        id: 'child_mia_001',
        parentId: 'parent_default_001',
        displayName: 'Mia',
        ageBand: 'builder',
        avatarKey: 'mia',
        preferredLanguage: 'en',
        currentXp: 180,
        currentStreak: 3,
        lastActiveDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'child_aarav_002',
        parentId: 'parent_default_001',
        displayName: 'Aarav',
        ageBand: 'explorer',
        avatarKey: 'aarav',
        preferredLanguage: 'en',
        currentXp: 90,
        currentStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
    ],
    lessons: [...ALL_STATIC_LESSONS],
    lesson_attempts: [],
    question_attempts: [],
    mastery_records: [],
    review_schedule: [],
    badges: [
      {
        id: 'number-ninja',
        name: 'Number Ninja',
        description: 'Mastered the Vedic ×11 lightning mental math trick!',
        iconKey: '🔢',
        criteria: { lessonId: 'vedic-x11' },
      },
      {
        id: 'pattern-spotter',
        name: 'Pattern Spotter',
        description: 'Discovered the hidden peg picture shapes in numbers!',
        iconKey: '🏅',
        criteria: { lessonId: 'visual-association' },
      },
      {
        id: 'palace-builder',
        name: 'Palace Builder',
        description: 'Navigated and completed your first spatial Memory Palace!',
        iconKey: '🏠',
        criteria: { lessonId: 'memory-palace' },
      },
      {
        id: 'fast-thinker',
        name: 'Fast Thinker',
        description: 'Broke huge number sequences into bite-sized chunks!',
        iconKey: '⚡',
        criteria: { lessonId: 'chunking' },
      },
      {
        id: 'memory-explorer',
        name: 'Memory Explorer',
        description: 'Built hilarious mnemonic sentence bridges across the planets!',
        iconKey: '🧠',
        criteria: { lessonId: 'mnemonics' },
      },
    ],
    user_badges: [],
    xp_events: [],
    analytics_events: [],
  };
}

let inMemoryDb: DbSchema | null = null;

export function loadDb(): DbSchema {
  if (inMemoryDb) {
    ensureLessons(inMemoryDb);
    return inMemoryDb;
  }

  const dbPath = getDbFilePath();
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf8');
      inMemoryDb = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read persistent DB, falling back to default:', err);
  }

  if (!inMemoryDb) {
    inMemoryDb = getDefaultDb();
  }

  ensureLessons(inMemoryDb);
  saveDb(inMemoryDb);
  return inMemoryDb;
}

export function saveDb(db: DbSchema): void {
  inMemoryDb = db;
  try {
    const dbPath = getDbFilePath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = `${dbPath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(tempFile, dbPath);
  } catch (err) {
    // Graceful fallback for read-only environments (e.g. Vercel serverless without disk access)
    console.warn('Persistent DB write failed, fallback to in-memory state:', err);
  }
}

function ensureLessons(db: DbSchema): void {
  if (!db.lessons) {
    db.lessons = [];
  }
  for (const staticLesson of ALL_STATIC_LESSONS) {
    const idx = db.lessons.findIndex((l) => l.id === staticLesson.id);
    if (idx >= 0) {
      db.lessons[idx] = staticLesson;
    } else {
      db.lessons.push(staticLesson);
    }
  }

  // Attempt local sync if files exist in dev environment
  try {
    const contentDir = path.join(process.cwd(), 'src', 'content', 'lessons');
    if (fs.existsSync(contentDir)) {
      const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        try {
          const fullPath = path.join(contentDir, file);
          const raw = fs.readFileSync(fullPath, 'utf8');
          const lesson = JSON.parse(raw) as Lesson;
          const idx = db.lessons.findIndex((l) => l.id === lesson.id);
          if (idx >= 0) {
            db.lessons[idx] = lesson;
          } else {
            db.lessons.push(lesson);
          }
        } catch {}
      }
    }
  } catch {}
}
