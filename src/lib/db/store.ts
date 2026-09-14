import fs from 'fs';
import path from 'path';
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

const DB_FILE = path.join(process.cwd(), 'data', 'memory_db.json');

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
    lessons: [],
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
  if (inMemoryDb) return inMemoryDb;

  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      inMemoryDb = JSON.parse(raw);
    } catch {
      inMemoryDb = getDefaultDb();
      saveDb(inMemoryDb);
    }
  } else {
    inMemoryDb = getDefaultDb();
    saveDb(inMemoryDb);
  }

  // Always sync lessons from content/lessons/
  syncLessons(inMemoryDb!);
  return inMemoryDb!;
}

export function saveDb(db: DbSchema): void {
  inMemoryDb = db;
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tempFile, DB_FILE);
}

function syncLessons(db: DbSchema) {
  const contentDir = path.join(process.cwd(), 'src', 'content', 'lessons');
  if (!fs.existsSync(contentDir)) return;

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.json'));
  const syncedLessons: Lesson[] = [];

  for (const file of files) {
    try {
      const fullPath = path.join(contentDir, file);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const lesson = JSON.parse(raw) as Lesson;
      syncedLessons.push(lesson);
    } catch (err) {
      console.error(`Failed to parse lesson file ${file}:`, err);
    }
  }

  if (syncedLessons.length > 0) {
    // Merge with existing lessons
    for (const newLesson of syncedLessons) {
      const idx = db.lessons.findIndex((l) => l.id === newLesson.id);
      if (idx >= 0) {
        db.lessons[idx] = newLesson;
      } else {
        db.lessons.push(newLesson);
      }
    }
    saveDb(db);
  }
}
