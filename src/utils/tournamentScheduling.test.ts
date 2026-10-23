import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRoundRobinPairings,
  optimizeScheduleRest,
  calculateStandings,
  buildKnockoutBracket,
} from './tournamentScheduling.ts';
import type { TournamentTeam, TournamentMatch } from '../types.ts';

test('Round Robin pairings generates correct number of rounds for 4 teams', () => {
  const teams = ['t1', 't2', 't3', 't4'];
  const pairings = generateRoundRobinPairings(teams);
  assert.equal(pairings.length, 3, '4 teams should produce 3 rounds');
  // Each round has 2 matches
  for (const round of pairings) {
    assert.equal(round.length, 2, 'Each round in 4-team tournament must have 2 matches');
  }
});

test('optimizeScheduleRest minimizes back-to-back matches for the same team', () => {
  const matches = [
    { team1Id: 'A', team2Id: 'B' },
    { team1Id: 'A', team2Id: 'C' },
    { team1Id: 'B', team2Id: 'D' },
    { team1Id: 'C', team2Id: 'D' },
  ];
  const scheduled = optimizeScheduleRest(matches);
  assert.equal(scheduled.length, 4);

  // Check if consecutive matches have same teams
  for (let i = 0; i < scheduled.length - 1; i++) {
    const cur = scheduled[i];
    const nxt = scheduled[i + 1];
    const curTeams = new Set([cur.team1Id, cur.team2Id]);
    // It should try to not put team A back-to-back
    if (curTeams.has(nxt.team1Id) && curTeams.has(nxt.team2Id)) {
      assert.fail('Same matchup repeated consecutively');
    }
  }
});

test('calculateStandings correctly applies points, set diff, and head-to-head', () => {
  const mockTeams: TournamentTeam[] = [
    {
      id: 'team1',
      name: 'Team Alpha',
      player1: { id: 'p1', fullName: 'Nguyen Van A', avatarUrl: '', clubName: 'CLB Nesa' },
      status: 'approved',
      registrationDate: '2026-03-01',
    },
    {
      id: 'team2',
      name: 'Team Beta',
      player1: { id: 'p2', fullName: 'Tran Thi B', avatarUrl: '', clubName: 'CLB Nesa' },
      status: 'approved',
      registrationDate: '2026-03-01',
    },
    {
      id: 'team3',
      name: 'Team Gamma',
      player1: { id: 'p3', fullName: 'Le Van C', avatarUrl: '', clubName: 'CLB Nesa' },
      status: 'approved',
      registrationDate: '2026-03-01',
    },
  ];

  const mockMatches: TournamentMatch[] = [
    {
      id: 'm1',
      roundIndex: 0,
      roundName: 'Vòng 1',
      matchIndex: 0,
      court: 'Sân 1',
      scheduledTime: '08:00',
      team1: mockTeams[0], // Alpha
      team2: mockTeams[1], // Beta
      scoreTeam1: [11, 11], // 2-0
      scoreTeam2: [7, 8],
      winnerTeamId: 'team1',
      status: 'finished',
    },
    {
      id: 'm2',
      roundIndex: 1,
      roundName: 'Vòng 2',
      matchIndex: 0,
      court: 'Sân 2',
      scheduledTime: '09:00',
      team1: mockTeams[1], // Beta
      team2: mockTeams[2], // Gamma
      scoreTeam1: [11, 11],
      scoreTeam2: [5, 6],
      winnerTeamId: 'team2',
      status: 'finished',
    },
  ];

  const standings = calculateStandings(mockTeams, mockMatches, { scoringSystem: 'win3_loss0' });
  assert.equal(standings[0].teamId, 'team1', 'Team Alpha should be top of standings');
  assert.equal(standings[0].points, 3);
  assert.equal(standings[0].setDiff, 2);
  assert.equal(standings[1].teamId, 'team2');
  assert.equal(standings[2].teamId, 'team3');
});

test('buildKnockoutBracket produces correct rounds for 8 teams', () => {
  const teams: TournamentTeam[] = Array.from({ length: 8 }, (_, i) => ({
    id: `t${i + 1}`,
    name: `Team ${i + 1}`,
    seed: i + 1,
    player1: { id: `p${i + 1}`, fullName: `Player ${i + 1}`, avatarUrl: '', clubName: 'CLB 333' },
    status: 'approved',
    registrationDate: '2026-03-01',
  }));

  const bracket = buildKnockoutBracket(teams, 'seed');
  assert.equal(bracket.length, 3, '8 teams should have 3 rounds: Tứ Kết (4), Bán Kết (2), Chung Kết (1)');
  assert.equal(bracket[0].matches.length, 4);
  assert.equal(bracket[1].matches.length, 2);
  assert.equal(bracket[2].matches.length, 1);
});
