# Interactive Memory Learning Platform
### Product Requirements Document + Technical Requirements Document
**Version 2.0 — Build-Ready Edition**
Prepared for AI-agent-assisted development (e.g. Antigravity / Gemini, high-reasoning mode)

---

## 0. How to Use This Document

This is a single source of truth, structured so it can be handed to an AI coding agent one section at a time.

- **Sections 1–10** are the *product* spec — what to build and why. Give these to the agent for context before any code is written.
- **Sections 11–19** are the *technical* spec — exact schemas, types, APIs, and algorithms. These are the ground truth. If generated code ever diverges from these, the schema/type in this document wins.
- **Section 20** is the **sprint-by-sprint build plan**, written as literal task lists with file paths and Definitions of Done. This is the section to paste into the agent sprint-by-sprint.
- **Appendix A** is a complete, ready-to-use lesson content file (`vedic-x11`) so the agent has real data to build and test against from Sprint 1 onward — it never has to invent placeholder content.

### Decisions locked in this revision

The original brief left several architectural choices open ("Supabase **or** Postgres+Node," unspecified color hex values, unspecified fonts/libraries). For a single AI-agent-driven build, ambiguity is expensive, so this revision **locks** those choices. They're called out explicitly wherever they appear, and are easy to swap later if you disagree — the content/data schemas (Sections 12–14) don't depend on the choice.

| Area | Decision |
|---|---|
| Backend | **Supabase** (Postgres + Auth + Row Level Security + Storage) — fastest path to a working MVP for one agent to build solo |
| Frontend framework | **Next.js 14 (App Router) + TypeScript** |
| Styling | **Tailwind CSS** with a custom token theme (Section 8) |
| Animation | **Framer Motion** |
| Drag & drop | **dnd-kit** (touch + mouse + keyboard accessible out of the box) |
| Client state | **Zustand** (lesson session state) + **TanStack Query** (server state/caching) |
| Validation | **Zod** (shared between API routes and content authoring) |
| Hosting | **Vercel** (frontend) + **Supabase** (managed Postgres) |
| Auth model | Parent/guardian account via Supabase Auth; child profiles are rows under the parent, not separate logins (MVP simplification) |

---

## 1. Product Vision

**Core promise:** *See it. Play with it. Remember it.*

Children should not read or watch memory techniques — they should **experience, manipulate, practise, and retrieve** them. Every lesson moves a child through:

**Curiosity → Understanding → Interaction → Practice → Recall → Mastery**

**MVP objective:** prove that children can learn and apply memory techniques through interactive, story-driven, simulation-based lessons — and that they can still recall the technique days later without support.

---

## 2. Problem Statement

Traditional teaching of facts, tables, spellings, and sequences leans on reading, copying, list-memorization, and worksheets. This platform instead teaches through **visualisation, association, chunking, mnemonics, stories, memory palaces, pattern recognition, mental-maths shortcuts, active recall, and spaced practice** — turning abstract memory strategies into concrete interactive experiences.

### Educational philosophy (5 principles)

1. **Learn by doing** — every lesson contains at least one meaningful interaction.
2. **Retrieval over recognition** — the child eventually answers with no visual assistance.
3. **Multiple encoding** — important information is encoded via visual + verbal + interaction + spatial + emotional/story elements together.
4. **Gradual removal of support** — Full guidance → Partial guidance → No guidance.
5. **Repetition over time** — learning continues after the lesson via scheduled recall (spaced repetition).

---

## 3. Users & Personas

### Primary: children, ages 7–14, split into three visual/difficulty bands (single unified UI for MVP; difficulty adapts per lesson, not per persona-specific UI)

| Band | Ages | Needs |
|---|---|---|
| **Explorer** | 7–9 | Large visuals, minimal text, voice guidance, more animation, short challenges, immediate feedback |
| **Builder** | 10–12 | Interactive explanations, harder tasks, basic strategy selection, more independence, progress/badges |
| **Challenger** | 13–14 | Faster challenges, advanced mental maths, strategy comparison, timed challenges, harder recall |

### Secondary: Parents

Need to see: what the child is learning, lesson completion, whether recall is improving, strongest/weakest techniques, practice frequency.

### Secondary: Teachers/Tutors

Need: per-student progress, completion, accuracy, recall performance, recommended revision, optional assignments. **Not in the first engineering milestone** — build only if needed for testing.

---

## 4. MVP Scope Lock

Quality over quantity. Build these **exceptionally well**:

1. **Vedic Maths ×11** — flagship mental-maths lesson (drives Sprint 1 build-out; see Appendix A for full content)
2. **Visual Association** — flagship visual-learning lesson
3. **Memory Palace** — flagship immersive simulation

Then add as simpler, supporting lessons:

4. **Chunking**
5. **Mnemonics**

### Feature priority

**P0 — Must have for MVP**
Child-friendly homepage · Lesson engine · Story panels · Animation · Interactive simulations · Question engine · Immediate feedback · Hints · Recall test · Progress screen · Basic mastery · All 5 lessons above · Responsive (mobile-first) design.

**P1 — Should have**
Audio narration · XP · Badges · Streaks · Spaced-review scheduling · Parent dashboard · Avatar selection.

**P2 — Later, not in MVP**
Teacher dashboard · Classroom management · Leaderboards · Social features · Personalised/AI-generated lesson content · Advanced Vedic Maths techniques · Offline/PWA mode.

### MVP acceptance criteria — a child can:

Open the site → choose a lesson → understand what to do with no adult help → complete a 4–5 panel story → watch an animated explanation → interact with the concept → complete ≥5 practice questions → receive hints → complete an independent recall challenge → see a child-friendly result screen → return later and complete a spaced review.

A parent/teacher can see: lesson completion, accuracy, mastery, and which techniques need review.

The dev team (or agent) can: add a new lesson without touching the lesson engine, add a new question type without changing existing content, track learning events, and edit lesson content independently of UI code.

---

## 5. Core UX Rules (non-negotiable)

1. One important question per screen.
2. One primary action per screen.
3. Show before explaining.
4. Let the child manipulate the concept — no decorative-only interactions.
5. Illustrations explain; they don't just decorate.
6. Hide complexity until it's needed.
7. Celebrate effort and improvement, not just correctness.
8. Remove hints before declaring mastery.
9. Test recall *after* the child thinks the lesson is finished.
10. Never sacrifice educational clarity for gamification.

---

## 6. Universal Lesson Architecture

Every lesson — regardless of technique — follows the same reusable ten-stage flow. This reuse is the single most important product decision in the spec.

```
LESSON → HOOK → STORY → CONCEPT EXPLANATION → ANIMATED DEMONSTRATION
  → INTERACTIVE SIMULATION → GUIDED PRACTICE → INDEPENDENT PRACTICE
  → RECALL TEST → RESULT → SPACED REVIEW (scheduled, off-session)
```

### Stage detail

- **Hook** — a challenge appears *before* the technique is explained ("Can you remember these 8 things?"), to establish curiosity, not to test.
- **Story** — a data-driven, 4–5 panel mini-story: *Problem → Discovery → Demonstration → Success → Challenge.* Recurring cast: **Mia** (curious, energetic student), **Aarav** (funny, slightly forgetful student), **Professor Piko** (playful mentor), **Byte** (small animated robot companion).
- **Concept explanation + Animated demonstration** — the mental model shown visually before any question is asked.
- **Interactive simulation** — the actual mental technique, simulated physically (digits move together for chunking; objects drag into rooms for memory palace; words snap into place for mnemonics; digits combine/transform for Vedic maths). Never merely decorative — every animation reinforces the mental model.
- **Guided practice (Level A)** — hints visible by default.
- **Independent practice (Level B → C)** — hints hidden until requested, then removed entirely for the final items.
- **Recall test** — the diagram/support is removed. This is the real test of whether the technique stuck.
- **Result** — child-friendly summary (mastery band reached, correct count, independent-answer count), not a raw percentage.
- **Spaced review** — scheduled automatically; happens in a later session (Section 10).

### Worked example — "The Magic of 11" (fully specified in Appendix A)

```
Hook:      "Can you solve 43 × 11 without a calculator?" (timer, child attempts, fails/succeeds)
Story:     Mia struggles → Professor Piko: "There's a secret hiding between the digits" →
           4 and 3 move apart, a glowing 7 appears between them → 43 → 473
Animation: 4  3  →  4+3=7  →  4 7 3  →  "43 × 11 = 473"
Simulation: child drags 4 and 3 into position, types the middle digit
Guided:    52 × 11 (hint available)
Independent: 61×11, 34×11, 72×11 (no hints)
Recall:    diagram removed — "Without looking, explain the ×11 trick" (free-text/verbal recall proxy: select the 3 correct steps in order)
Result:    "🧠 Pattern Power: Strong · ⭐ 4/5 correct · ⚡ 3 independent answers · 🔥 Come back tomorrow"
```

---

## 7. Content Systems

### 7.1 Question types (engine must support all of these from Sprint 1's shared components, even if only 2–3 are used by MVP lessons)

`multiple_choice` · `single_select` · `multi_select` · `drag_drop` · `matching` · `ordering` (sequence) · `numeric` · `text_recall` · `simulation` (pass/fail from simulation completion state) · `timed_recall` (P1, older children only)

### 7.2 Hint system

Hints are **progressive and ordered** (shown one at a time, on request):

```
Q: 67 × 11 = ?
Hint 1: "Think about the two outside digits."
Hint 2: "What is 6 + 7?"
Hint 3: "Put that answer between 6 and 7."
```

Hint usage is tracked per question attempt (`hints_used`) and directly reduces the mastery score (Section 9) — a child who needed 3 hints does not score the same as one who solved it independently.

### 7.3 Feedback copy — tone rules

Never evaluative or harsh. Always encouraging, specific, and actionable.

| Situation | Don't say | Say instead |
|---|---|---|
| Wrong answer | "❌ Wrong!" | "Almost! Give it another try." / "Nice attempt! Look at the middle digit again." |
| Correct answer | "Correct." | "⭐ You spotted the pattern!" / "🎉 Great recall!" |
| Technical error | (stack trace / generic 500) | "Oops! Our memory robot got confused. Try again." + a single **Try Again** button, no technical detail exposed |

### 7.4 Story panel model

```json
{
  "id": 1,
  "image": "/stories/chunking/panel-1.svg",
  "character": "mia",
  "text": "Mia has to remember a very long number.",
  "duration": 5
}
```
Support: static illustration, light motion, speech bubble, narration audio (optional), text caption, next/previous control (child-paced, never auto-advance only).

---

## 8. Design System

### 8.1 Colour tokens (Tailwind theme extension — use these exact values)

```js
// tailwind.config.ts — theme.extend.colors
colors: {
  bg:        { DEFAULT: '#FBF8F3', lavender: '#F3F0FB', blue: '#EFF6FC' }, // soft cream default background
  primary:   { DEFAULT: '#6C9BD8', light: '#8FB8E8', dark: '#4E7FBE' },     // soft blue
  secondary: { DEFAULT: '#B79FE0', light: '#D2C3EE', dark: '#9A7DC9' },     // soft purple
  accent:    { DEFAULT: '#FFC85C', light: '#FFDA8F', dark: '#E8AC2E' },     // warm yellow
  success:   { DEFAULT: '#7BC9A0', light: '#A6DEC1', dark: '#57A87E' },     // mint green
  attention: { DEFAULT: '#FFB27A', light: '#FFCBA3', dark: '#E8935A' },     // peach/orange
  error:     { DEFAULT: '#FF8A80', light: '#FFB0A8', dark: '#E85F53' },     // soft coral
  ink:       { DEFAULT: '#2E2A4A', muted: '#6B6580' },                     // text primary / secondary
}
```
Rule: pastel everywhere by default; reserve saturated accent/success/error/attention colours strictly for state and hierarchy (never as large background fills). Never rely on colour alone to signal correctness — always pair with an icon (✅/🔁) and text.

### 8.2 Typography

- **Headings / questions:** `Baloo 2` (rounded, bold, friendly, large x-height) — Google Fonts.
- **Body / instructions:** `Nunito` — rounded sans, high readability at small sizes.
- Hierarchy: Question (largest, bold, centered) > Instruction (medium, calm) > Supporting text (smallest readable size, never below 14px equivalent for the youngest band).

### 8.3 Component style

Large rounded cards (`rounded-3xl`) · large pill buttons with big tap targets (min 44×44px) · answer options as large tappable cards, never a thin radio-button row · progress shown visually (filled bar / meter), numeric % never the primary display.

### 8.4 Core reusable components (build once, reuse across all lessons)

`LessonHeader` · `ProgressIndicator` · `StoryPanel` · `Character` · `QuestionCard` · `AnswerCard` · `DragDropBoard` · `SimulationCanvas` · `MemoryObject` · `HintButton` · `FeedbackToast` · `XPIndicator` · `StreakBadge` · `MasteryMeter` · `RecallChallenge` · `LessonCompletion` · `ReviewCard`

### 8.5 Navigation (MVP)

```
Home · Learn · Progress
```
(`Challenges` added in P1 once XP/badges/streaks exist.)

### 8.6 Home screen shape

Greeting → single large "Today's Challenge" card with one `START` action → streak (🔥) + XP (⭐) chips → an "Explore" row of other lesson categories. **Not** a stats dashboard — always leads with the next action.

### 8.7 Responsive & interaction

Mobile-first (tablet and school-laptop are primary real devices). Every simulation interaction (drag/drop, tap, type) must work identically with touch and mouse — this is why **dnd-kit** is specified over raw HTML5 DnD (which is mouse-only).

---

## 9. Gamification & Mastery Model

### 9.1 XP

Awarded for: completing a lesson, answering independently (no hints), successful recall, returning to complete a scheduled review. Gamification motivates; it never substitutes for the learning metrics below.

### 9.2 Badges (MVP set)

🏅 Pattern Spotter · 🧠 Memory Explorer · ⚡ Fast Thinker · 🏠 Palace Builder · 🔢 Number Ninja

### 9.3 Streaks

Reward consistency; never punish a missed day beyond resetting the counter (no negative XP, no shaming copy).

### 9.4 Mastery — four stages, driven by a numeric score

| Score | Stage |
|---|---|
| 0–39 | **Discovered** — technique introduced |
| 40–64 | **Practising** — still uses hints |
| 65–84 | **Strong** — performs independently |
| 85–100 | **Mastered** — succeeds on *delayed* recall, not just same-session |

**Mastery is not permanent.** Poor performance on a later scheduled review reduces the score — this is what makes it a dynamic memory model rather than a one-time completion flag.

### 9.5 Mastery score formula (server-computed, never trust the client)

```
Mastery Score =
    Accuracy               × 0.40
  + Independent Performance × 0.25
  + Delayed Recall Accuracy × 0.25
  + Consistency             × 0.10
```
Where `Independent Performance` = accuracy on questions answered with `hints_used = 0`, and `Consistency` = a rolling measure of attempts-without-large-accuracy-drops across sessions. Weights are a starting point — flag them as tunable, not sacred, and log enough raw data (Section 18) to retune later.

---

## 10. Spaced Repetition Engine

Every **completed** lesson creates a review schedule for that (child, lesson) pair.

### 10.1 Default interval sequence

```
Review 1 → 1 day
Review 2 → 3 days
Review 3 → 7 days
Review 4 → 14 days
Review 5 → 30 days
```

### 10.2 Adaptive adjustment (evaluated after each completed review)

```
if review_performance_score < 60:
    # forgotten — pull the review in and add support
    next_interval = max(1, current_interval / 2)   # days, floor of 1
    next_review_support_level = "guided"           # re-show hints by default
    mastery_score -= penalty                       # Section 9.5 recompute, may drop a stage

elif review_performance_score >= 90:
    # recalled easily — push out and raise difficulty
    next_interval = current_interval * 1.5
    next_question_difficulty += 1

else:
    # normal — follow the default sequence
    next_interval = default_sequence[next_index]
```

A review is a short, session-agnostic activity: recall challenge only (no story/animation replay) unless the child requests to re-watch the explanation.

---

## 11. Technical Architecture

### 11.1 Stack (see decision table in Section 0)

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + dnd-kit + Zustand + TanStack Query + Zod
- **Backend/DB:** Supabase (Postgres, Auth, Row Level Security, Storage for SVG/audio assets)
- **Hosting:** Vercel (app) + Supabase (managed Postgres)

### 11.2 High-level diagram

```
                    WEB CLIENT (Next.js)
                        |
            -------------------------------
            |            |                |
        Lessons UI   Simulations UI    Progress/Parent UI
            |            |                |
            -------------+----------------
                          |
              Next.js Route Handlers (/api/*)
                          |
            -------------------------------
            |            |                |
      Supabase Auth  Supabase Postgres  Supabase Storage
      (parent login)  (all tables,      (SVG/audio assets)
                       RLS enforced)
                          |
                 Analytics events table
```

### 11.3 Repository structure

```
src/
├── app/
│   ├── (marketing)/                # optional public landing
│   ├── home/
│   ├── learn/
│   ├── lesson/[lessonId]/
│   ├── progress/
│   ├── review/
│   ├── parent/                     # parent dashboard (separate visual shell)
│   └── api/
│       ├── children/
│       ├── lessons/
│       ├── attempts/
│       ├── reviews/
│       └── badges/
│
├── components/
│   ├── ui/                         # LessonHeader, ProgressIndicator, buttons, cards...
│   ├── lesson/
│   ├── story/
│   ├── simulation/                 # one subfolder per simulation type
│   │   ├── chunking/
│   │   ├── mnemonics/
│   │   ├── visual-association/
│   │   ├── memory-palace/
│   │   └── vedic-x11/
│   ├── questions/                  # one component per question `type`
│   └── gamification/
│
├── content/
│   └── lessons/                    # one JSON file per lesson (see Appendix A)
│       ├── chunking.json
│       ├── mnemonics.json
│       ├── visual-association.json
│       ├── memory-palace.json
│       └── vedic-x11.json
│
├── lib/
│   ├── supabase/                   # client + server clients
│   ├── analytics/
│   ├── scoring/                    # Section 9.5 + 15
│   ├── mastery/
│   └── spaced-repetition/          # Section 10
│
└── types/
    ├── lesson.ts                   # Section 13
    ├── question.ts
    └── database.ts                 # generated from Supabase schema
```

Lessons are **data-driven**: new lessons are added as a new JSON file under `content/lessons/` plus SVG/audio assets — never by writing new page components. Validate every content file against the Zod schema in Section 13 (add a `pnpm validate:content` script that runs in CI).

---

## 12. Database Schema (Supabase / Postgres)

```sql
-- ========== ENUMS ==========
create type age_band as enum ('explorer', 'builder', 'challenger');
create type technique_category as enum ('chunking', 'mnemonics', 'visual_association', 'memory_palace', 'vedic_maths');
create type attempt_status as enum ('in_progress', 'completed', 'abandoned');
create type mastery_stage as enum ('discovered', 'practising', 'strong', 'mastered');
create type review_status as enum ('scheduled', 'completed', 'missed');
create type xp_source as enum ('lesson_complete', 'independent_answer', 'recall_success', 'review_complete');

-- ========== PARENT / CHILD ==========
create table parent_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parent_profiles(id) on delete cascade,
  display_name text not null,
  age_band age_band not null,
  avatar_key text not null default 'default',
  preferred_language text not null default 'en',
  current_xp int not null default 0,
  current_streak int not null default 0,
  last_active_date date,
  created_at timestamptz not null default now()
);

-- ========== CONTENT ==========
create table lessons (
  id text primary key,                 -- e.g. 'vedic-x11', matches content/lessons/*.json
  title text not null,
  technique_category technique_category not null,
  age_range_min int not null,
  age_range_max int not null,
  order_index int not null,
  content jsonb not null,              -- full Lesson JSON, validated against Section 13 schema at publish time
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== ATTEMPTS ==========
create table lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  lesson_id text not null references lessons(id),
  status attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score numeric,                       -- mastery score snapshot for this attempt, 0-100
  accuracy numeric,                    -- 0-1
  hint_count int not null default 0,
  independent_accuracy numeric,        -- 0-1
  recall_accuracy numeric              -- 0-1
);

create table question_attempts (
  id uuid primary key default gen_random_uuid(),
  lesson_attempt_id uuid not null references lesson_attempts(id) on delete cascade,
  question_id text not null,           -- matches id inside the lesson content JSON
  child_id uuid not null references children(id) on delete cascade,
  answer jsonb not null,               -- shape depends on question type
  correct boolean not null,
  hints_used int not null default 0,
  time_ms int not null,
  attempt_number int not null default 1,
  created_at timestamptz not null default now()
);

-- ========== MASTERY & REVIEW ==========
create table mastery_records (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  lesson_id text not null references lessons(id),
  mastery_score numeric not null default 0,   -- 0-100, Section 9.5 formula
  mastery_stage mastery_stage not null default 'discovered',
  history jsonb not null default '[]',        -- append-only log of {score, stage, at}
  updated_at timestamptz not null default now(),
  unique (child_id, lesson_id)
);

create table review_schedule (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  lesson_id text not null references lessons(id),
  review_number int not null,          -- 1..5+, Section 10
  scheduled_for date not null,
  completed_at timestamptz,
  performance_score numeric,           -- 0-100
  status review_status not null default 'scheduled'
);

-- ========== GAMIFICATION ==========
create table badges (
  id text primary key,                 -- e.g. 'pattern-spotter'
  name text not null,
  description text not null,
  icon_key text not null,
  criteria jsonb not null              -- machine-readable unlock condition
);

create table user_badges (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  badge_id text not null references badges(id),
  earned_at timestamptz not null default now(),
  unique (child_id, badge_id)
);

create table xp_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  source_type xp_source not null,
  source_id text,                      -- lesson_id / review id / etc.
  xp_amount int not null,
  created_at timestamptz not null default now()
);

-- ========== ANALYTICS ==========
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete set null,
  event_type text not null,            -- see Section 18 for the fixed vocabulary
  event_payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ========== ROW LEVEL SECURITY ==========
alter table parent_profiles enable row level security;
alter table children enable row level security;
alter table lesson_attempts enable row level security;
alter table question_attempts enable row level security;
alter table mastery_records enable row level security;
alter table review_schedule enable row level security;
alter table user_badges enable row level security;
alter table xp_events enable row level security;
alter table analytics_events enable row level security;

-- Pattern for every child-owned table: parent can only touch rows for their own children.
create policy "parent owns children" on children
  for all using (parent_id = auth.uid());

create policy "parent owns attempts via child" on lesson_attempts
  for all using (child_id in (select id from children where parent_id = auth.uid()));

-- Repeat the same "child_id in (select id from children where parent_id = auth.uid())"
-- policy for: question_attempts, mastery_records, review_schedule, user_badges, xp_events, analytics_events.

-- lessons and badges are public read, no RLS needed beyond is_published filtering in the API layer.
```

---

## 13. Content Schema (TypeScript + Zod)

```typescript
// types/lesson.ts

export type QuestionType =
  | "multiple_choice" | "single_select" | "multi_select"
  | "drag_drop" | "matching" | "ordering"
  | "numeric" | "text_recall" | "simulation" | "timed_recall";

export interface Question {
  id: string;                 // stable, e.g. "q001"
  type: QuestionType;
  prompt: string;
  options?: { id: string; label: string }[];   // for choice/select/matching/ordering
  answer: unknown;            // shape depends on `type` — validated per-type in Zod
  difficulty: 1 | 2 | 3 | 4 | 5;
  hints: string[];            // ordered, revealed one at a time
  supportLevel: "guided" | "assisted" | "independent";  // Section 7.2 / Level A/B/C
}

export interface StoryPanel {
  id: number;
  image: string;               // path under /content or Supabase Storage
  character: "mia" | "aarav" | "professor_piko" | "byte" | null;
  text: string;
  duration: number;            // seconds, auto-narration pacing; child can always advance manually
}

export interface SimulationConfig {
  simulationType: "chunking" | "mnemonics" | "visual_association" | "memory_palace" | "vedic_x11";
  objects: Record<string, unknown>[];     // simulation-specific object list
  interactions: string[];                 // human-readable list, e.g. ["drag digits together"]
  validation: Record<string, unknown>;    // simulation-specific completion rule
  completionCondition: string;
}

export type LessonSection =
  | { type: "hook"; prompt: string; timerSeconds?: number }
  | { type: "story"; panels: StoryPanel[] }
  | { type: "explanation"; animation: Record<string, unknown> }
  | { type: "simulation"; config: SimulationConfig }
  | { type: "practice"; level: "guided" | "assisted" | "independent"; questions: Question[] }
  | { type: "recall"; questions: Question[] }
  | { type: "result" };

export interface Lesson {
  id: string;                          // matches DB `lessons.id` and filename
  title: string;
  techniqueCategory: "chunking" | "mnemonics" | "visual_association" | "memory_palace" | "vedic_maths";
  ageRange: [number, number];
  sections: LessonSection[];
  badgeOnComplete?: string;            // badge id from `badges` table
}
```

```typescript
// lib/schemas/lesson.schema.ts — Zod mirror of the above, used to validate
// every file in content/lessons/*.json at build time and before publish.
// Keep this file's shape in exact sync with types/lesson.ts.
```

---

## 14. API Contract

All routes are Next.js Route Handlers under `src/app/api/`. All mutating routes require an authenticated parent session (Supabase Auth) and verify `child_id` belongs to that parent before touching any row (defense in depth on top of RLS).

| Method | Route | Purpose | Body / Params | Response |
|---|---|---|---|---|
| `GET` | `/api/lessons` | List published lessons, filterable by `ageBand` | query: `ageBand?` | `Lesson[]` (metadata only, no full content) |
| `GET` | `/api/lessons/:id` | Full lesson content for play | — | `Lesson` (full, Section 13 shape) |
| `POST` | `/api/children` | Create a child profile | `{ displayName, ageBand, avatarKey }` | `Child` |
| `GET` | `/api/children/:childId` | Fetch a child profile | — | `Child` |
| `POST` | `/api/lessons/:id/start` | Begin an attempt | `{ childId }` | `{ attemptId }` |
| `POST` | `/api/attempts/:attemptId/questions/:questionId` | Record one question attempt | `{ answer, hintsUsed, timeMs }` | `{ correct: boolean, feedback: string }` |
| `POST` | `/api/attempts/:attemptId/complete` | Finalize attempt: compute score, mastery, schedule reviews, award XP/badges | `{}` | `{ score, masteryStage, xpAwarded, badgesEarned, nextReviewDate }` |
| `GET` | `/api/children/:childId/progress` | Mastery per lesson + XP + streak | — | `{ xp, streak, lessons: { lessonId, masteryStage, masteryScore }[] }` |
| `GET` | `/api/children/:childId/reviews` | Reviews due today/overdue | — | `ReviewSchedule[]` |
| `POST` | `/api/reviews/:reviewId/complete` | Submit review performance | `{ performanceScore }` | `{ nextIntervalDays, newMasteryStage }` |
| `GET` | `/api/children/:childId/badges` | Earned badges | — | `Badge[]` |
| `POST` | `/api/analytics/events` | Fire-and-forget event log | `{ childId?, eventType, payload }` | `{ ok: true }` |

Every response body is validated against a Zod schema on the way out; every request body is validated on the way in. Reject with `400` + child-friendly-safe generic error on validation failure (never leak the Zod error internals to the client UI — log server-side only).

---

## 15. Core Algorithms (reference pseudocode)

### 15.1 Compute mastery score (server-side, runs on attempt completion and after each review)

```typescript
function computeMasteryScore(input: {
  accuracy: number;               // 0-1, this attempt
  independentAccuracy: number;    // 0-1, hints_used = 0 subset
  delayedRecallAccuracy: number;  // 0-1, from most recent completed review, or 0 if none yet
  consistency: number;            // 0-1, rolling variance-based measure across attempts
}): number {
  const score =
    input.accuracy * 40 +
    input.independentAccuracy * 25 +
    input.delayedRecallAccuracy * 25 +
    input.consistency * 10;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function masteryStageFor(score: number): MasteryStage {
  if (score >= 85) return "mastered";
  if (score >= 65) return "strong";
  if (score >= 40) return "practising";
  return "discovered";
}
```

### 15.2 Schedule next review (Section 10, as code)

```typescript
const DEFAULT_INTERVALS_DAYS = [1, 3, 7, 14, 30];

function nextReviewInterval(reviewNumber: number, lastPerformanceScore: number, lastIntervalDays: number): number {
  if (lastPerformanceScore < 60) return Math.max(1, Math.round(lastIntervalDays / 2));
  if (lastPerformanceScore >= 90) return Math.round(lastIntervalDays * 1.5);
  return DEFAULT_INTERVALS_DAYS[reviewNumber] ?? Math.round(lastIntervalDays * 1.5);
}
```

### 15.3 Simulation completion validation

Each simulation type ships its own pure validation function taking the current object state and returning `boolean`, e.g. for chunking:

```typescript
function isChunkingComplete(groups: string[][], targetChunks: string[][]): boolean {
  return groups.length === targetChunks.length &&
    groups.every((g, i) => g.join("") === targetChunks[i].join(""));
}
```

---

## 16. Component Library Spec (props sketch)

```typescript
<LessonHeader lessonTitle={string} stage={LessonSection["type"]} onExit={() => void} />
<ProgressIndicator value={0-1} label={string} variant="bar" | "steps" />
<StoryPanel panel={StoryPanel} onNext={() => void} onPrev={() => void} />
<Character name={"mia" | "aarav" | "professor_piko" | "byte"} emotion={string} />
<QuestionCard question={Question} onAnswer={(answer) => void} hintsRevealed={number} onRequestHint={() => void} />
<AnswerCard label={string} state={"default" | "selected" | "correct" | "incorrect"} onSelect={() => void} />
<DragDropBoard items={...} zones={...} onDrop={(itemId, zoneId) => void} />        // built on dnd-kit
<SimulationCanvas type={SimulationConfig["simulationType"]} config={SimulationConfig} onComplete={() => void} />
<HintButton hintsAvailable={number} hintsUsed={number} onReveal={() => void} />
<FeedbackToast tone={"encouraging" | "celebratory"} message={string} />
<XPIndicator xp={number} delta?={number} />
<StreakBadge days={number} />
<MasteryMeter stage={MasteryStage} score={number} />
<RecallChallenge questions={Question[]} onComplete={(results) => void} />
<LessonCompletion summary={{...}} badgesEarned={Badge[]} onContinue={() => void} />
<ReviewCard review={ReviewSchedule} onStart={() => void} />
```

---

## 17. Accessibility, Performance, Security & Privacy

### 17.1 Accessibility
Large tap targets (≥44px) · full keyboard support (including drag-drop via dnd-kit's keyboard sensor) · captions for all narration · sound always optional/toggleable · reduced-motion mode (respect `prefers-reduced-motion` and offer an in-app toggle) · high-contrast mode · minimal reading load for the Explorer band · never colour-only signaling (Section 8.1).

### 17.2 Performance targets
First meaningful interaction < 2–3s on a reasonable connection · animations targeting ~60fps · assets as optimized SVG/WebP · lazy-load lesson assets (never preload every lesson's art on the homepage).

### 17.3 Security
HTTPS everywhere · Supabase Auth for parent sessions · Row Level Security as the source of truth for data access (Section 12) · server-side input validation (Zod) on every route · rate limiting on attempt/review endpoints · minimal session data retention · **never trust a client-submitted mastery/score value — always recompute server-side** (Section 15.1 runs in the API route, not the browser).

### 17.4 Privacy (children are the primary audience)
Collect the minimum personal data necessary (display name + age band only — no birthdate, no email for the child). No child-to-child messaging. No public profiles. No public leaderboards that expose a child's identity. No targeted advertising anywhere in the learning experience. Sensitive administrative data (parent email, billing) lives only under the parent account, never the child profile.

---

## 18. Analytics Event Vocabulary

Fixed `event_type` values (extend by adding new ones, never repurpose existing ones):

```
lesson_started · story_completed · simulation_started · simulation_completed
question_answered · hint_requested · lesson_completed · recall_completed
badge_earned · review_completed · review_missed
```

Track across three buckets:
- **Lesson metrics:** started, completed, time spent, story completion, interaction completion.
- **Learning metrics:** first-attempt accuracy, hint usage, independent accuracy, recall accuracy, recall latency, delayed recall accuracy.
- **Behaviour metrics:** sessions/week, returning learners, lessons/session, practice attempts, review completion rate.

These feed the MVP success metrics (Section 19) — instrument events from Sprint 1, don't bolt them on later.

---

## 19. Core Success Metrics (validate with real user testing, not asserted)

| Metric | Target |
|---|---|
| Lesson completion rate | > 70% |
| Independent practice accuracy | > 75% |
| Delayed recall accuracy | 65–75% |
| Voluntary next-challenge rate after finishing a lesson | > 40% |

---

## 20. Build Roadmap — Agent-Executable Sprint Plan

Each sprint below is written as a literal task list. Paste one sprint at a time to the coding agent; treat the "Definition of Done" as the acceptance check before moving to the next sprint.

### Sprint 0 — Environment & Scaffolding
- [ ] `npx create-next-app@latest` with TypeScript, Tailwind, App Router.
- [ ] Install: `framer-motion`, `@dnd-kit/core` `@dnd-kit/sortable`, `zustand`, `@tanstack/react-query`, `zod`, `@supabase/supabase-js` `@supabase/ssr`.
- [ ] Create a Supabase project; run the full schema from Section 12 as a migration (`supabase/migrations/0001_init.sql`).
- [ ] Add the Tailwind theme extension from Section 8.1 and load `Baloo 2` / `Nunito` via `next/font`.
- [ ] Scaffold the repository structure from Section 11.3 (empty folders + placeholder files).
- [ ] Add `types/lesson.ts` (Section 13) and its Zod mirror.
- [ ] **DoD:** app boots locally, connects to Supabase, Tailwind tokens render in a throwaway test page, `pnpm typecheck` passes.

### Sprint 1 — Foundation UI + Lesson Engine Shell
- [ ] Build `components/ui/*` core components (Section 16) with mock data — no real lesson yet.
- [ ] Build the generic **Lesson Engine**: a route at `app/lesson/[lessonId]/page.tsx` that fetches a `Lesson` object and renders `sections` in order via a state machine (Zustand store: current section index, per-section state).
- [ ] Drop `content/lessons/vedic-x11.json` from **Appendix A** into `content/lessons/` and wire `GET /api/lessons/vedic-x11` to serve it (straight from the JSON file for now; DB-backed content sync can come later).
- [ ] Build `Home` and `Learn` screens (Section 8.6) pointing at this one lesson.
- [ ] Basic analytics: fire `lesson_started` / `lesson_completed` events to `/api/analytics/events`.
- [ ] **DoD:** a user can open Home → start "The Magic of 11" → click through every section type in order using mock/placeholder art, with no crashes.

### Sprint 2 — Lesson 1: Vedic ×11 (complete, end-to-end, real interaction)
- [ ] Build the `vedic_x11` `SimulationCanvas` (drag digits apart, type the middle digit — Appendix A has full content).
- [ ] Build `numeric` and `ordering` question components fully (used by this lesson's practice/recall).
- [ ] Wire real question-attempt recording: `POST /api/attempts/:attemptId/questions/:questionId`.
- [ ] Wire attempt completion: `POST /api/attempts/:attemptId/complete`, computing score via Section 15.1 and scheduling reviews via Section 15.2.
- [ ] Build the `LessonCompletion` result screen with real mastery/score data.
- [ ] **DoD:** a full playthrough of "The Magic of 11" persists real rows to `lesson_attempts`, `question_attempts`, `mastery_records`, and `review_schedule`.

### Sprint 3 — Lesson 2: Mnemonics
- [ ] Author `content/lessons/mnemonics.json` (planets mnemonic, per Section 6 pattern).
- [ ] Build the `mnemonics` simulation (drag word cards to assemble a sentence; then the sentence disappears for recall).
- [ ] Build `matching` question component if not already generic enough from Sprint 2.
- [ ] **DoD:** Mnemonics lesson playable end to end, using the same generic Lesson Engine with zero engine-code changes — only new content + one new simulation component.

### Sprint 4 — Lesson 3: Visual Association (flagship #2)
- [ ] Author `content/lessons/visual-association.json` (digit → image pegs, e.g. 5→hand, 2→swan, 7→axe).
- [ ] Build the `visual_association` simulation: connect each number to an image; later, images disappear and numbers must be recalled.
- [ ] Build `drag_drop` matching-to-image question variant.
- [ ] **DoD:** Visual Association playable end to end; art assets lazy-loaded per Section 17.2.

### Sprint 5 — Lesson 4: Memory Palace (flagship #3, most complex)
- [ ] Author `content/lessons/memory-palace.json` (a small room: door, bed, desk, bookshelf, window).
- [ ] Build the `memory_palace` `SimulationCanvas`: an SVG/Canvas room where the child drags labeled `MemoryObject`s onto locations; later labels disappear and the child recalls what's where by clicking through the room.
- [ ] **DoD:** Memory Palace playable end to end; this is the most novel simulation, budget the most review/testing time here.

### Sprint 6 — Lesson 5: Chunking (simplest, last)
- [ ] Author `content/lessons/chunking.json` (long digit string → grouped chunks).
- [ ] Build the `chunking` simulation using the existing `DragDropBoard`.
- [ ] **DoD:** all 5 MVP lessons are playable end to end using only the shared engine + 5 content files + 5 simulation components.

### Sprint 7 — Recall System, Gamification, Progress
- [ ] Build the **Review Queue**: `GET /api/children/:childId/reviews` + `app/review/page.tsx`, listing due reviews and launching the short recall-only flow.
- [ ] Implement XP events, badge-award logic (server-side, on attempt/review completion), and the badge set from Section 9.2.
- [ ] Build `Progress` screen: `MasteryMeter` per lesson, streak, XP — visual, not a stats table (Section 8.6 tone applies here too).
- [ ] **DoD:** completing a lesson schedules a review; completing that review (even simulated by backdating a date in dev) updates mastery per Section 10.2 and is visible on the Progress screen.

### Sprint 8 — Parent Dashboard, Polish, Testing
- [ ] Build `app/parent/` — visually distinct shell (Section 58 tone: calmer, more information-dense than the child UI is allowed to be). Show per-child: mastery per technique, recall performance, recommended review.
- [ ] Accessibility pass: keyboard nav through one full lesson, reduced-motion toggle, contrast check.
- [ ] Unit tests: scoring (15.1), review scheduling (15.2), each simulation's completion-validation function.
- [ ] E2E test (Playwright): Login → choose lesson → complete story → complete simulation → answer questions → complete recall → verify progress updated.
- [ ] Real child usability test pass (manual, not automatable) — watch for confusion points, note them against Section 5's UX rules.
- [ ] **DoD:** Section 4's full MVP acceptance criteria checklist passes for a first-time user with no prior explanation.

---

## Appendix A — Reference Lesson Content: "The Magic of 11"

Use this file verbatim as `content/lessons/vedic-x11.json` from Sprint 1 onward so the engine is always built against real content, never placeholders.

```json
{
  "id": "vedic-x11",
  "title": "The Magic of 11",
  "techniqueCategory": "vedic_maths",
  "ageRange": [8, 12],
  "badgeOnComplete": "number-ninja",
  "sections": [
    {
      "type": "hook",
      "prompt": "Can you solve 43 × 11 without a calculator?",
      "timerSeconds": 20
    },
    {
      "type": "story",
      "panels": [
        { "id": 1, "image": "/stories/vedic-x11/panel-1.svg", "character": "mia", "text": "Mia is stuck on a multiplication problem.", "duration": 5 },
        { "id": 2, "image": "/stories/vedic-x11/panel-2.svg", "character": "professor_piko", "text": "There is a secret hiding between the digits.", "duration": 5 },
        { "id": 3, "image": "/stories/vedic-x11/panel-3.svg", "character": "professor_piko", "text": "Watch: the 4 and 3 move apart, and a glowing 7 appears between them.", "duration": 6 },
        { "id": 4, "image": "/stories/vedic-x11/panel-4.svg", "character": "mia", "text": "43 becomes 473! I found the trick!", "duration": 4 },
        { "id": 5, "image": "/stories/vedic-x11/panel-5.svg", "character": "byte", "text": "Now it's your turn to try it.", "duration": 4 }
      ]
    },
    {
      "type": "explanation",
      "animation": {
        "steps": ["4    3", "4 + 3 = 7", "4  7  3", "43 × 11 = 473"]
      }
    },
    {
      "type": "simulation",
      "config": {
        "simulationType": "vedic_x11",
        "objects": [{ "id": "digit-left", "value": 4 }, { "id": "digit-right", "value": 3 }],
        "interactions": ["drag digit-left and digit-right apart", "type the sum into the middle slot"],
        "validation": { "middleDigit": 7 },
        "completionCondition": "middleDigit entered equals sum of outer digits"
      }
    },
    {
      "type": "practice",
      "level": "guided",
      "questions": [
        {
          "id": "q001",
          "type": "numeric",
          "prompt": "52 × 11 = ?",
          "answer": 572,
          "difficulty": 2,
          "hints": ["Think about the two outside digits.", "What is 5 + 2?", "Put that answer between 5 and 2."],
          "supportLevel": "guided"
        }
      ]
    },
    {
      "type": "practice",
      "level": "independent",
      "questions": [
        { "id": "q002", "type": "numeric", "prompt": "61 × 11 = ?", "answer": 671, "difficulty": 2, "hints": ["Add the two outside digits."], "supportLevel": "independent" },
        { "id": "q003", "type": "numeric", "prompt": "34 × 11 = ?", "answer": 374, "difficulty": 2, "hints": ["Add the two outside digits."], "supportLevel": "independent" },
        { "id": "q004", "type": "numeric", "prompt": "72 × 11 = ?", "answer": 792, "difficulty": 2, "hints": ["Add the two outside digits."], "supportLevel": "independent" }
      ]
    },
    {
      "type": "recall",
      "questions": [
        {
          "id": "q005",
          "type": "ordering",
          "prompt": "Without looking, put the ×11 steps in the right order.",
          "options": [
            { "id": "a", "label": "Keep the first digit" },
            { "id": "b", "label": "Add the two digits together" },
            { "id": "c", "label": "Put that sum in the middle" },
            { "id": "d", "label": "Keep the last digit" }
          ],
          "answer": ["a", "b", "c", "d"],
          "difficulty": 3,
          "hints": [],
          "supportLevel": "independent"
        }
      ]
    },
    { "type": "result" }
  ]
}
```

---

## Appendix B — Definition of Done, Full Prototype

The prototype is ready for real user testing only when **all** of the following are true simultaneously:

**Child can:** open the site, choose a lesson, understand what to do with no adult help, complete a 4–5 panel story, watch the animated explanation, interact with the concept, complete ≥5 practice questions, receive hints, complete an independent recall challenge, see a child-friendly result screen, return later and complete a scheduled review.

**Parent/teacher can:** see lesson completion, accuracy, mastery, and which techniques need review.

**The team/agent can:** add a new lesson by adding one JSON content file (no lesson-engine code changes), add a new question type without touching existing lesson content, see every learning event in `analytics_events`, and edit lesson content independently of UI code.
