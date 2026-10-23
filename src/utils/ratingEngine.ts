import type { Athlete, MatchHistoryRecord, Achievement } from '../types.ts';

export interface RatingCalculationResult {
  eloRating: number;
  duprRating: number;
  totalMatchesWon: number;
  totalMatchesLost: number;
  winRatePercent: number;
  eloBreakdown: {
    base: number;
    fromMatches: number;
    fromMedals: number;
  };
  duprBreakdown: {
    base: number;
    fromMatches: number;
    fromMedals: number;
  };
}

/**
 * Calculates current Elo and DUPR Rating for an athlete based on their career performance
 */
export function calculatePerformanceRatings(
  careerHistory: MatchHistoryRecord[] = [],
  achievements: Achievement[] = [],
  initialBaseElo: number = 1400,
  initialBaseDupr: number = 3.5
): RatingCalculationResult {
  let matchesEloDelta = 0;
  let matchesDuprDelta = 0;
  let wins = 0;
  let losses = 0;

  careerHistory.forEach(m => {
    if (m.result === 'win') {
      wins++;
      matchesEloDelta += 24;
      matchesDuprDelta += 0.05;
    } else {
      losses++;
      matchesEloDelta -= 12;
      matchesDuprDelta -= 0.02;
    }
  });

  let medalsEloDelta = 0;
  let medalsDuprDelta = 0;

  achievements.forEach(ach => {
    switch (ach.medal) {
      case 'gold':
        medalsEloDelta += 60;
        medalsDuprDelta += 0.15;
        break;
      case 'silver':
        medalsEloDelta += 35;
        medalsDuprDelta += 0.08;
        break;
      case 'bronze':
        medalsEloDelta += 20;
        medalsDuprDelta += 0.04;
        break;
      case 'mvp':
        medalsEloDelta += 50;
        medalsDuprDelta += 0.10;
        break;
    }
  });

  const finalElo = Math.max(1000, Math.min(2800, Math.round(initialBaseElo + matchesEloDelta + medalsEloDelta)));
  const finalDupr = Math.max(2.0, Math.min(6.5, Number((initialBaseDupr + matchesDuprDelta + medalsDuprDelta).toFixed(2))));

  const totalPlayed = wins + losses;
  const winRatePercent = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;

  return {
    eloRating: finalElo,
    duprRating: finalDupr,
    totalMatchesWon: wins,
    totalMatchesLost: losses,
    winRatePercent,
    eloBreakdown: {
      base: initialBaseElo,
      fromMatches: matchesEloDelta,
      fromMedals: medalsEloDelta,
    },
    duprBreakdown: {
      base: initialBaseDupr,
      fromMatches: Number(matchesDuprDelta.toFixed(2)),
      fromMedals: Number(medalsDuprDelta.toFixed(2)),
    },
  };
}
