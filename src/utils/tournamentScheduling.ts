import type {
  TournamentTeam,
  TournamentMatch,
  TournamentRound,
  StandingRow,
  TournamentRules,
  Athlete,
  TournamentFormat,
} from '../types.ts';

/**
 * Standard international tie-break criteria order:
 * 1. Match Points (Wins)
 * 2. Head-to-Head between tied teams
 * 3. Set Differential (Sets Won - Sets Lost)
 * 4. Point Differential (Points Won - Points Lost)
 * 5. Total Points Won
 */
export const DEFAULT_INTERNATIONAL_RULES: TournamentRules = {
  matchFormatDesc: 'Thi đấu 3 ván thắng 2 (Best of 3), chạm 11 hoặc chạm 21 tùy bộ môn. Cách 2 điểm thắng.',
  pointsToWinSet: 11,
  setsToWinMatch: 2,
  maxPointsPerSet: 15,
  scoringSystem: 'win2_loss1_forfeit0',
  winPoints: 2,
  lossPoints: 1,
  forfeitPoints: 0,
  tiebreakSummary: 'Thể lệ chuẩn: Thắng 2 điểm, Thua 1 điểm, Bỏ cuộc 0 điểm. Chỉ số phụ ưu tiên: Đối đầu trực tiếp -> Hiệu số ván -> Hiệu số điểm -> Tổng điểm thắng -> Bốc thăm.',
  tiebreakCriteria: [
    'Điểm số bảng (Thắng 2 điểm, Thua 1 điểm, Bỏ cuộc 0 điểm)',
    'Đối đầu trực tiếp (Head-to-head)',
    'Hiệu số ván thắng/thua (Set differential)',
    'Hiệu số điểm thắng/thua (Point differential)',
    'Tổng điểm ghi được (Total points scored)',
    'Bốc thăm may mắn (Random draw)',
  ],
  internationalStandards: 'Áp dụng theo quy chuẩn Luật Pickleball Quốc Tế (USAPA/IFP) và Luật Thể Thao Châu Á.',
};

/**
 * Circle / Polygon method for Round Robin pairing
 */
export function generateRoundRobinPairings(teamIds: string[]): Array<Array<[string, string]>> {
  const pool = [...teamIds];
  if (pool.length % 2 !== 0) {
    pool.push('BYE');
  }
  const n = pool.length;
  const roundsCount = n - 1;
  const half = n / 2;
  const schedule: Array<Array<[string, string]>> = [];

  for (let r = 0; r < roundsCount; r++) {
    const roundMatches: Array<[string, string]> = [];
    for (let i = 0; i < half; i++) {
      const t1 = pool[i];
      const t2 = pool[n - 1 - i];
      if (t1 !== 'BYE' && t2 !== 'BYE') {
        roundMatches.push([t1, t2]);
      }
    }
    schedule.push(roundMatches);
    // Rotate elements except pool[0]
    const fixed = pool[0];
    const rest = pool.slice(1);
    rest.unshift(rest.pop()!);
    pool.splice(0, pool.length, fixed, ...rest);
  }

  return schedule;
}

/**
 * Re-orders matches across rounds so that no team has to play 2 consecutive matches
 * where mathematically possible ("hạn chế 1 đội phải đánh liền 2 trận")
 */
export function optimizeScheduleRest<T extends { team1Id: string; team2Id: string }>(
  allMatches: T[]
): T[] {
  if (allMatches.length <= 2) return [...allMatches];

  const result: T[] = [];
  const remaining = [...allMatches];

  // Pick first match
  result.push(remaining.shift()!);

  while (remaining.length > 0) {
    const lastMatch = result[result.length - 1];
    const lastTeams = new Set([lastMatch.team1Id, lastMatch.team2Id]);

    // Find next match where NEITHER team was in the last match
    const bestIndex = remaining.findIndex(
      m => !lastTeams.has(m.team1Id) && !lastTeams.has(m.team2Id)
    );

    if (bestIndex !== -1) {
      result.push(remaining.splice(bestIndex, 1)[0]);
    } else {
      // If unavoidable, pick match with fewest overlap or first remaining
      result.push(remaining.shift()!);
    }
  }

  return result;
}

/**
 * Generates full Round Robin Tournament structure with rest notices & courts
 */
export function buildRoundRobinTournament(
  teams: TournamentTeam[],
  courts: string[] = ['Sân 1', 'Sân 2', 'Sân 3']
): TournamentRound[] {
  if (teams.length < 2) return [];

  const teamMap = new Map(teams.map(t => [t.id, t]));
  const pairingsByRound = generateRoundRobinPairings(teams.map(t => t.id));

  // Flatten and optimize with rest constraints
  type IntermediateMatch = {
    team1Id: string;
    team2Id: string;
    roundIndex: number;
    originalMatchIndex: number;
  };

  const flatList: IntermediateMatch[] = [];
  pairingsByRound.forEach((roundPairs, rIdx) => {
    roundPairs.forEach((pair, mIdx) => {
      flatList.push({
        team1Id: pair[0],
        team2Id: pair[1],
        roundIndex: rIdx,
        originalMatchIndex: mIdx,
      });
    });
  });

  const optimized = optimizeScheduleRest(flatList);

  // Group back into rounds or ordered match progression
  const rounds: TournamentRound[] = [];
  const matchesPerRound = Math.floor(teams.length / 2);

  let currentRoundIndex = 0;
  for (let i = 0; i < optimized.length; i += matchesPerRound) {
    const chunk = optimized.slice(i, i + matchesPerRound);
    const roundMatches: TournamentMatch[] = chunk.map((m, idx) => {
      const t1 = teamMap.get(m.team1Id);
      const t2 = teamMap.get(m.team2Id);
      const courtName = courts[(i + idx) % courts.length];

      // Check if team had rest
      const isTeam1Rested = i === 0 || !optimized.slice(Math.max(0, i + idx - 1), i + idx).some(prev => prev.team1Id === m.team1Id || prev.team2Id === m.team1Id);
      const isTeam2Rested = i === 0 || !optimized.slice(Math.max(0, i + idx - 1), i + idx).some(prev => prev.team1Id === m.team2Id || prev.team2Id === m.team2Id);

      const restNotice = isTeam1Rested && isTeam2Rested
        ? '✓ Đảm bảo thời gian hồi phục tiêu chuẩn'
        : '⚡ Trận liên tiếp kế tiếp - được ưu tiên 10p nghỉ giải lao';

      return {
        id: `m-rr-${currentRoundIndex + 1}-${idx + 1}`,
        roundIndex: currentRoundIndex,
        roundName: `Vòng ${currentRoundIndex + 1}`,
        matchIndex: idx,
        court: courtName,
        scheduledTime: `Trận ${i + idx + 1}`,
        team1: t1,
        team2: t2,
        scoreTeam1: [0, 0, 0],
        scoreTeam2: [0, 0, 0],
        status: 'scheduled',
        restNotice,
      };
    });

    rounds.push({
      roundIndex: currentRoundIndex,
      name: `Vòng ${currentRoundIndex + 1}`,
      matches: roundMatches,
    });
    currentRoundIndex++;
  }

  return rounds;
}

/**
 * Standard tournament bracket generator for Knockout (Single Elimination)
 * Supports 4, 8, 16, 32 teams.
 */
export function buildKnockoutBracket(
  teams: TournamentTeam[],
  seedMode: 'seed' | 'random' | 'manual' = 'seed',
  courts: string[] = ['Sân Trung Tâm', 'Sân 1', 'Sân 2']
): TournamentRound[] {
  if (teams.length < 2) return [];

  // Determine bracket size: nearest power of 2
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(Math.max(4, teams.length))));
  let orderedTeams: (TournamentTeam | undefined)[] = [...teams];

  if (seedMode === 'random') {
    orderedTeams = orderedTeams.sort(() => Math.random() - 0.5);
  } else if (seedMode === 'seed') {
    orderedTeams.sort((a, b) => ((a && a.seed !== undefined) ? a.seed : 999) - ((b && b.seed !== undefined) ? b.seed : 999));
  }

  // Pad with byes if needed
  while (orderedTeams.length < bracketSize) {
    orderedTeams.push(undefined);
  }

  // Standard seeding bracket order for 4, 8, 16
  const getSeedPairings = (size: number): number[] => {
    if (size === 4) return [0, 3, 1, 2];
    if (size === 8) return [0, 7, 3, 4, 1, 6, 2, 5];
    if (size === 16) return [0, 15, 7, 8, 3, 12, 4, 11, 1, 14, 6, 9, 2, 13, 5, 10];
    return Array.from({ length: size }, (_, i) => i);
  };

  const seedIndexes = getSeedPairings(bracketSize);
  const totalRounds = Math.log2(bracketSize);

  const rounds: TournamentRound[] = [];
  let matchesCount = bracketSize / 2;

  const roundTitles: Record<number, string> = {
    1: 'Chung Kết',
    2: 'Bán Kết',
    4: 'Tứ Kết',
    8: 'Vòng 1/8 (16 Đội)',
    16: 'Vòng 1/16 (32 Đội)',
  };

  for (let r = 0; r < totalRounds; r++) {
    const roundMatches: TournamentMatch[] = [];
    const rName = roundTitles[matchesCount] || `Vòng ${r + 1}`;

    for (let m = 0; m < matchesCount; m++) {
      let t1: TournamentTeam | undefined;
      let t2: TournamentTeam | undefined;

      if (r === 0) {
        t1 = orderedTeams[seedIndexes[m * 2]];
        t2 = orderedTeams[seedIndexes[m * 2 + 1]];
      }

      roundMatches.push({
        id: `ko-r${r}-m${m}`,
        roundIndex: r,
        roundName: rName,
        matchIndex: m,
        court: courts[m % courts.length],
        scheduledTime: `Giờ thi đấu TBD`,
        team1: t1,
        team2: t2,
        scoreTeam1: [0, 0, 0],
        scoreTeam2: [0, 0, 0],
        status: 'scheduled',
        restNotice: r > 0 ? '✓ Đảm bảo tối thiểu 45 phút nghỉ sau trận trước' : '✓ Sẵn sàng khởi động',
      });
    }

    rounds.push({
      roundIndex: r,
      name: rName,
      matches: roundMatches,
    });
    matchesCount /= 2;
  }

  return rounds;
}

/**
 * Standings calculation according to International & National Rules:
 * Points (Win 2, Loss 1, Forfeit 0) > Head-to-Head > Set Diff > Point Diff > Points Scored > Total Wins
 */
export function calculateStandings(
  teams: TournamentTeam[],
  matches: TournamentMatch[],
  rules?: Partial<TournamentRules>
): StandingRow[] {
  const map = new Map<string, StandingRow>();

  // Determine scoring points
  const winPts = rules?.winPoints !== undefined ? rules.winPoints : (rules?.scoringSystem === 'win3_loss0' ? 3 : 2);
  const lossPts = rules?.lossPoints !== undefined ? rules.lossPoints : (rules?.scoringSystem === 'win3_loss0' ? 0 : 1);
  const forfeitPts = rules?.forfeitPoints !== undefined ? rules.forfeitPoints : 0;

  teams.forEach(t => {
    map.set(t.id, {
      rank: 1,
      teamId: t.id,
      teamName: t.name,
      played: 0,
      won: 0,
      lost: 0,
      forfeited: 0,
      setsWon: 0,
      setsLost: 0,
      setDiff: 0,
      pointsWon: 0,
      pointsLost: 0,
      pointDiff: 0,
      points: 0,
      headToHeadWon: [],
    });
  });

  matches.forEach(m => {
    if (m.status !== 'finished' || !m.team1 || !m.team2) return;
    const row1 = map.get(m.team1.id);
    const row2 = map.get(m.team2.id);
    if (!row1 || !row2) return;

    row1.played += 1;
    row2.played += 1;

    let setsWon1 = 0;
    let setsWon2 = 0;
    let pts1 = 0;
    let pts2 = 0;

    for (let i = 0; i < m.scoreTeam1.length; i++) {
      const s1 = m.scoreTeam1[i] || 0;
      const s2 = m.scoreTeam2[i] || 0;
      if (s1 === 0 && s2 === 0) continue;
      pts1 += s1;
      pts2 += s2;
      if (s1 > s2) setsWon1++;
      else if (s2 > s1) setsWon2++;
    }

    row1.setsWon += setsWon1;
    row1.setsLost += setsWon2;
    row1.setDiff = row1.setsWon - row1.setsLost;
    row1.pointsWon += pts1;
    row1.pointsLost += pts2;
    row1.pointDiff = row1.pointsWon - row1.pointsLost;

    row2.setsWon += setsWon2;
    row2.setsLost += setsWon1;
    row2.setDiff = row2.setsWon - row2.setsLost;
    row2.pointsWon += pts2;
    row2.pointsLost += pts1;
    row2.pointDiff = row2.pointsWon - row2.pointsLost;

    const isForfeit = m.notes?.toLowerCase().includes('bỏ cuộc') || m.notes?.toLowerCase().includes('forfeit');

    if (m.winnerTeamId === m.team1.id || setsWon1 > setsWon2) {
      row1.won += 1;
      row1.points += winPts;
      row2.lost += 1;
      if (isForfeit) {
        row2.forfeited = (row2.forfeited || 0) + 1;
        row2.points += forfeitPts;
      } else {
        row2.points += lossPts;
      }
      row1.headToHeadWon = [...(row1.headToHeadWon || []), m.team2.id];
    } else if (m.winnerTeamId === m.team2.id || setsWon2 > setsWon1) {
      row2.won += 1;
      row2.points += winPts;
      row1.lost += 1;
      if (isForfeit) {
        row1.forfeited = (row1.forfeited || 0) + 1;
        row1.points += forfeitPts;
      } else {
        row1.points += lossPts;
      }
      row2.headToHeadWon = [...(row2.headToHeadWon || []), m.team1.id];
    }
  });

  const rows = Array.from(map.values());

  rows.sort((a, b) => {
    // 1. Match points (Thắng 2, Thua 1, Bỏ cuộc 0)
    if (b.points !== a.points) return b.points - a.points;

    // 2. Head-to-Head (Đối đầu trực tiếp)
    if (a.headToHeadWon?.includes(b.teamId)) return -1;
    if (b.headToHeadWon?.includes(a.teamId)) return 1;

    // 3. Set Diff (Hiệu số ván)
    if (b.setDiff !== a.setDiff) return b.setDiff - a.setDiff;

    // 4. Point Diff (Hiệu số điểm)
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;

    // 5. Total Points Won (Tổng điểm ghi được)
    if (b.pointsWon !== a.pointsWon) return b.pointsWon - a.pointsWon;

    // 6. Number of matches won (Số trận thắng)
    return b.won - a.won;
  });

  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

/**
 * Bốc thăm chia đội từ danh sách VĐV đã điểm danh
 * Hỗ trợ:
 * - auto_balanced: Cân bằng Elo/DUPR (ghép VĐV Elo cao nhất với Elo thấp nhất)
 * - auto_random: Xáo trộn ngẫu nhiên hoàn toàn
 * - manual_pairs: Ghép theo danh sách cặp thủ công
 */
export function pairAthletesIntoTeams(
  athletesList: Athlete[],
  pairingMethod: 'auto_balanced' | 'auto_random' | 'manual_lottery',
  isDoubles: boolean = true,
  manualPairs?: Array<{ p1Id: string; p2Id?: string; teamName?: string }>
): TournamentTeam[] {
  if (manualPairs && manualPairs.length > 0) {
    return manualPairs.map((pair, idx) => {
      const p1 = athletesList.find(a => a.id === pair.p1Id) || athletesList[0];
      const p2 = pair.p2Id ? athletesList.find(a => a.id === pair.p2Id) : undefined;
      return {
        id: `tm-${Date.now()}-${idx + 1}`,
        name: pair.teamName || (p2 ? `Đội ${p1.fullName} & ${p2.fullName}` : `VĐV ${p1.fullName}`),
        seed: idx + 1,
        status: 'paid' as const,
        registrationDate: new Date().toISOString().slice(0, 10),
        captainId: p1.id,
        captainName: p1.fullName,
        player1: {
          id: p1.id,
          fullName: p1.fullName,
          nickname: p1.nickname,
          avatarUrl: p1.avatarUrl,
          clubName: p1.clubName,
          phone: p1.phone,
        },
        player2: p2
          ? {
              id: p2.id,
              fullName: p2.fullName,
              nickname: p2.nickname,
              avatarUrl: p2.avatarUrl,
              clubName: p2.clubName,
              phone: p2.phone,
            }
          : undefined,
      };
    });
  }

  // If Singles
  if (!isDoubles) {
    const list = pairingMethod === 'auto_random' ? [...athletesList].sort(() => Math.random() - 0.5) : [...athletesList];
    return list.map((a, idx) => ({
      id: `tm-${Date.now()}-${idx + 1}`,
      name: a.fullName,
      seed: idx + 1,
      status: 'paid' as const,
      registrationDate: new Date().toISOString().slice(0, 10),
      captainId: a.id,
      captainName: a.fullName,
      player1: {
        id: a.id,
        fullName: a.fullName,
        nickname: a.nickname,
        avatarUrl: a.avatarUrl,
        clubName: a.clubName,
        phone: a.phone,
      },
    }));
  }

  // Doubles Pairing
  const pool = [...athletesList];
  const teams: TournamentTeam[] = [];

  if (pairingMethod === 'auto_balanced') {
    // Sort by Elo descending
    pool.sort((a, b) => b.eloRating - a.eloRating);
    const n = pool.length;
    const pairsCount = Math.floor(n / 2);
    for (let i = 0; i < pairsCount; i++) {
      const p1 = pool[i];
      const p2 = pool[n - 1 - i];
      teams.push({
        id: `tm-${Date.now()}-${i + 1}`,
        name: `Đôi ${p1.fullName} & ${p2.fullName}`,
        seed: i + 1,
        status: 'paid' as const,
        registrationDate: new Date().toISOString().slice(0, 10),
        captainId: p1.id,
        captainName: p1.fullName,
        player1: {
          id: p1.id,
          fullName: p1.fullName,
          nickname: p1.nickname,
          avatarUrl: p1.avatarUrl,
          clubName: p1.clubName,
          phone: p1.phone,
        },
        player2: {
          id: p2.id,
          fullName: p2.fullName,
          nickname: p2.nickname,
          avatarUrl: p2.avatarUrl,
          clubName: p2.clubName,
          phone: p2.phone,
        },
      });
    }
  } else {
    // Random or Lottery
    pool.sort(() => Math.random() - 0.5);
    let pairIdx = 1;
    for (let i = 0; i < pool.length; i += 2) {
      const p1 = pool[i];
      const p2 = pool[i + 1];
      if (!p1) break;
      teams.push({
        id: `tm-${Date.now()}-${pairIdx}`,
        name: p2 ? `Đôi ${p1.fullName} & ${p2.fullName}` : `VĐV ${p1.fullName}`,
        seed: pairIdx,
        status: 'paid' as const,
        registrationDate: new Date().toISOString().slice(0, 10),
        captainId: p1.id,
        captainName: p1.fullName,
        player1: {
          id: p1.id,
          fullName: p1.fullName,
          nickname: p1.nickname,
          avatarUrl: p1.avatarUrl,
          clubName: p1.clubName,
          phone: p1.phone,
        },
        player2: p2
          ? {
              id: p2.id,
              fullName: p2.fullName,
              nickname: p2.nickname,
              avatarUrl: p2.avatarUrl,
              clubName: p2.clubName,
              phone: p2.phone,
            }
          : undefined,
      });
      pairIdx++;
    }
  }

  return teams;
}

/**
 * Xếp lịch / phân nhánh theo kết quả bốc thăm của Đội Trưởng
 * Mỗi đội có drawLotNumber (hoặc bracketSlot).
 */
export function buildBracketFromCaptainDraw(
  teams: TournamentTeam[],
  format: TournamentFormat
): TournamentRound[] {
  // Sort teams by their draw lot number or bracket slot
  const sorted = [...teams].sort((a, b) => {
    const slotA = a.bracketSlot ?? a.drawLotNumber ?? a.seed ?? 99;
    const slotB = b.bracketSlot ?? b.drawLotNumber ?? b.seed ?? 99;
    return slotA - slotB;
  });

  if (format === 'round_robin') {
    return buildRoundRobinTournament(sorted);
  }
  return buildKnockoutBracket(sorted, 'seed');
}

/**
 * Xếp lịch / phân nhánh theo hình thức lựa chọn thủ công (Manual Matchups)
 */
export function buildManualMatchupsTournament(
  pairs: Array<{ team1: TournamentTeam; team2: TournamentTeam; court?: string; scheduledTime?: string; scheduledDate?: string }>,
  format: TournamentFormat
): TournamentRound[] {
  if (pairs.length === 0) return [];
  const courts = ['Sân 1', 'Sân 2', 'Sân 3', 'Sân Center Court'];
  const firstRoundMatches: TournamentMatch[] = pairs.map((pair, idx) => ({
    id: `m-manual-r0-${idx + 1}`,
    roundIndex: 0,
    roundName: pairs.length <= 2 ? 'Bán Kết' : pairs.length <= 4 ? 'Tứ Kết' : 'Vòng 1',
    matchIndex: idx,
    court: pair.court || courts[idx % courts.length],
    scheduledTime: pair.scheduledTime || `${String(8 + Math.floor(idx * 0.75)).padStart(2, '0')}:${idx % 2 === 0 ? '00' : '45'}`,
    scheduledDate: pair.scheduledDate || new Date().toISOString().slice(0, 10),
    team1: pair.team1,
    team2: pair.team2,
    scoreTeam1: [0, 0, 0],
    scoreTeam2: [0, 0, 0],
    status: 'scheduled',
    restNotice: '✓ Phân cặp thủ công bởi Ban Tổ Chức',
  }));

  if (format === 'round_robin') {
    return [
      {
        roundIndex: 0,
        name: 'Vòng Bảng (Phân Cặp Thủ Công)',
        matches: firstRoundMatches,
      },
    ];
  }

  const rounds: TournamentRound[] = [
    {
      roundIndex: 0,
      name: pairs.length === 1 ? 'Chung Kết' : pairs.length === 2 ? 'Bán Kết' : pairs.length <= 4 ? 'Tứ Kết' : 'Vòng 1',
      matches: firstRoundMatches,
    },
  ];

  let nextMatchCount = Math.floor(pairs.length / 2);
  let r = 1;
  while (nextMatchCount >= 1) {
    const rName = nextMatchCount === 1 ? 'Chung Kết' : nextMatchCount === 2 ? 'Bán Kết' : `Vòng ${r + 1}`;
    const nextMatches: TournamentMatch[] = [];
    for (let m = 0; m < nextMatchCount; m++) {
      nextMatches.push({
        id: `m-manual-r${r}-${m + 1}`,
        roundIndex: r,
        roundName: rName,
        matchIndex: m,
        court: courts[m % courts.length],
        scheduledTime: 'Giờ thi đấu TBD',
        scheduledDate: new Date().toISOString().slice(0, 10),
        scoreTeam1: [0, 0, 0],
        scoreTeam2: [0, 0, 0],
        status: 'scheduled',
        restNotice: '✓ Đảm bảo tối thiểu 45 phút nghỉ sau trận trước',
      });
    }
    rounds.push({
      roundIndex: r,
      name: rName,
      matches: nextMatches,
    });
    if (nextMatchCount === 1) break;
    nextMatchCount = Math.floor(nextMatchCount / 2);
    r++;
  }

  return rounds;
}

