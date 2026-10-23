import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAthleteHealth } from './athleteHealth.ts';
import { calculatePerformanceRatings } from './ratingEngine.ts';

test('calculateAthleteHealth computes ideal weight range and recommendations correctly', () => {
  const result = calculateAthleteHealth(175, 72, 'male');
  assert.ok(result.bmi > 22 && result.bmi < 24.5, `BMI should be around 23.5, got ${result.bmi}`);
  assert.equal(result.bmiCategory, 'Thể hình cân đối VĐV');
  assert.ok(result.idealWeightMinKg >= 64 && result.idealWeightMaxKg <= 76);
  assert.ok(result.dailyProteinGrams > 100);
  assert.ok(result.dailyWaterLiters > 2.5);
  assert.ok(result.nutritionAdvice.length >= 4);
  assert.ok(result.workoutAdvice.length >= 4);
});

test('calculatePerformanceRatings updates Elo and DUPR based on match wins and medals', () => {
  const ratings = calculatePerformanceRatings(
    [
      { id: '1', tournamentName: 'T1', date: '2026-01-01', discipline: 'Pickleball', opponentName: 'Opp1', result: 'win', score: '11-9', round: 'R1', stage: 'KO' },
      { id: '2', tournamentName: 'T1', date: '2026-01-02', discipline: 'Pickleball', opponentName: 'Opp2', result: 'win', score: '11-8', round: 'R2', stage: 'KO' },
    ],
    [
      { id: 'm1', title: 'Huy Chương Vàng', tournamentName: 'T1', year: 2026, medal: 'gold', discipline: 'Pickleball' }
    ],
    1400,
    3.5
  );

  // 2 wins (+48 Elo, +0.10 DUPR), 1 gold medal (+60 Elo, +0.15 DUPR)
  assert.equal(ratings.eloRating, 1400 + 48 + 60);
  assert.equal(ratings.duprRating, 3.5 + 0.10 + 0.15);
  assert.equal(ratings.totalMatchesWon, 2);
  assert.equal(ratings.winRatePercent, 100);
});
