// Test suite for Section 9.5 and 15 algorithms

function computeMasteryScore(input) {
  const score =
    input.accuracy * 40 +
    input.independentAccuracy * 25 +
    input.delayedRecallAccuracy * 25 +
    input.consistency * 10;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function masteryStageFor(score) {
  if (score >= 85) return "mastered";
  if (score >= 65) return "strong";
  if (score >= 40) return "practising";
  return "discovered";
}

const DEFAULT_INTERVALS_DAYS = [1, 3, 7, 14, 30];

function nextReviewInterval(reviewNumber, lastPerformanceScore, lastIntervalDays = 1) {
  if (lastPerformanceScore < 60) return Math.max(1, Math.round(lastIntervalDays / 2));
  if (lastPerformanceScore >= 90) return Math.max(2, Math.round(lastIntervalDays * 1.5));
  const idx = Math.min(reviewNumber, DEFAULT_INTERVALS_DAYS.length - 1);
  return DEFAULT_INTERVALS_DAYS[idx] ?? Math.round(lastIntervalDays * 1.5);
}

console.log('🧪 Testing Mastery Scoring Algorithm (Section 9.5 & 15.1)...');

// Test Case 1: Perfect attempt with zero hints
const score1 = computeMasteryScore({
  accuracy: 1.0,
  independentAccuracy: 1.0,
  delayedRecallAccuracy: 1.0,
  consistency: 1.0,
});
console.log(`Test 1 (Perfect run): score=${score1}, stage=${masteryStageFor(score1)}`);
if (score1 !== 100 || masteryStageFor(score1) !== 'mastered') throw new Error('Test 1 failed');

// Test Case 2: Intermediate run with some hints
const score2 = computeMasteryScore({
  accuracy: 0.8,
  independentAccuracy: 0.5,
  delayedRecallAccuracy: 0.7,
  consistency: 0.6,
});
console.log(`Test 2 (Moderate run): score=${score2}, stage=${masteryStageFor(score2)}`);
if (score2 < 40 || score2 > 84) throw new Error('Test 2 failed');

// Test Case 3: Review scheduler adaptive intervals
console.log('\n🧪 Testing Spaced Repetition Intervals (Section 10 & 15.2)...');
const srs1 = nextReviewInterval(0, 95, 1); // high score
console.log(`SRS High Score (last=1d): next=${srs1} days`);
const srs2 = nextReviewInterval(1, 50, 4); // low score -> cut in half
console.log(`SRS Low Score (last=4d): next=${srs2} days`);
if (srs2 !== 2) throw new Error('SRS low score contraction failed');

console.log('\n🎉 All core scoring & SRS algorithm tests passed successfully!');
