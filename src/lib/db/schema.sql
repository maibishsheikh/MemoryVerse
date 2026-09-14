-- SQLite schema mirroring PostgreSQL schema from PRD Section 12

CREATE TABLE IF NOT EXISTS parent_profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  age_band TEXT NOT NULL CHECK (age_band IN ('explorer', 'builder', 'challenger')),
  avatar_key TEXT NOT NULL DEFAULT 'mia',
  preferred_language TEXT NOT NULL DEFAULT 'en',
  current_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 1,
  last_active_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  technique_category TEXT NOT NULL CHECK (technique_category IN ('chunking', 'mnemonics', 'visual_association', 'memory_palace', 'vedic_maths')),
  age_range_min INTEGER NOT NULL,
  age_range_max INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  content TEXT NOT NULL, -- JSON string
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lesson_attempts (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  score REAL,
  accuracy REAL,
  hint_count INTEGER NOT NULL DEFAULT 0,
  independent_accuracy REAL,
  recall_accuracy REAL
);

CREATE TABLE IF NOT EXISTS question_attempts (
  id TEXT PRIMARY KEY,
  lesson_attempt_id TEXT NOT NULL REFERENCES lesson_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  answer TEXT NOT NULL, -- JSON string
  correct INTEGER NOT NULL,
  hints_used INTEGER NOT NULL DEFAULT 0,
  time_ms INTEGER NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mastery_records (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  mastery_score REAL NOT NULL DEFAULT 0,
  mastery_stage TEXT NOT NULL DEFAULT 'discovered' CHECK (mastery_stage IN ('discovered', 'practising', 'strong', 'mastered')),
  history TEXT NOT NULL DEFAULT '[]', -- JSON array of {score, stage, at}
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(child_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS review_schedule (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  review_number INTEGER NOT NULL,
  scheduled_for TEXT NOT NULL,
  completed_at TEXT,
  performance_score REAL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed'))
);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_key TEXT NOT NULL,
  criteria TEXT NOT NULL -- JSON string
);

CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id),
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(child_id, badge_id)
);

CREATE TABLE IF NOT EXISTS xp_events (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('lesson_complete', 'independent_answer', 'recall_success', 'review_complete')),
  source_id TEXT,
  xp_amount INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES children(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
